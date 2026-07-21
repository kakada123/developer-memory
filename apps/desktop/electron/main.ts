import { app, BrowserWindow, dialog, ipcMain, Menu, nativeTheme, shell, utilityProcess } from 'electron';
import type { Input, MenuItemConstructorOptions, UtilityProcess } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { realpath, stat } from 'node:fs/promises';
import { detectProject } from './project-detection';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const applicationName = 'Developer Memory';
const temporaryDeveloperMode = true;
const apiPort = app.isPackaged ? 47823 : 47821;
const apiHealthUrl = `http://127.0.0.1:${apiPort}/health`;
const selectedDirectories = new Set<string>();
const windowBackground = (): string => nativeTheme.shouldUseDarkColors ? '#11131a' : '#f6f7fb';
let apiProcess: UtilityProcess | null = null;

app.setName(applicationName);
const hasSingleInstanceLock = app.requestSingleInstanceLock();

interface RegisteredProjectResponse {
  path?: unknown;
}

interface OpenInEditorResult {
  opened: boolean;
  error?: string;
}

function isInside(root: string, candidate: string): boolean {
  const pathFromRoot = relative(root, candidate);
  return pathFromRoot === ''
    || (!pathFromRoot.startsWith(`..${sep}`) && pathFromRoot !== '..' && !isAbsolute(pathFromRoot));
}

async function resolveRegisteredProjectRoot(projectId: unknown): Promise<string | null> {
  if (typeof projectId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(projectId)) {
    return null;
  }

  const response = await fetch(`http://127.0.0.1:47821/projects/${encodeURIComponent(projectId)}`);
  if (!response.ok) return null;

  const project = await response.json() as RegisteredProjectResponse;
  if (typeof project.path !== 'string') return null;

  const root = await realpath(project.path);
  return (await stat(root)).isDirectory() ? root : null;
}

async function openProjectFile(projectId: unknown, relativePath: unknown, line: unknown): Promise<OpenInEditorResult> {
  if (typeof relativePath !== 'string' || !relativePath || isAbsolute(relativePath)) {
    return { opened: false, error: 'The file path is invalid.' };
  }

  try {
    const root = await resolveRegisteredProjectRoot(projectId);
    if (!root) return { opened: false, error: 'The registered project could not be found.' };

    const candidate = await realpath(resolve(root, relativePath));
    const candidateStat = await stat(candidate);
    if (!isInside(root, candidate)) {
      return { opened: false, error: 'The selected file is no longer available in this project.' };
    }

    if (relativePath === '.') {
      if (!candidateStat.isDirectory()) {
        return { opened: false, error: 'The registered project folder is no longer available.' };
      }

      const vscodeUrl = pathToFileURL(candidate).href.replace(/^file:\/\//, 'vscode://file');
      await shell.openExternal(vscodeUrl);
      return { opened: true };
    }

    if (!candidateStat.isFile()) {
      return { opened: false, error: 'The selected file is no longer available in this project.' };
    }

    const targetLine = typeof line === 'number' && Number.isSafeInteger(line) && line >= 1 ? line : 1;
    const vscodeUrl = pathToFileURL(candidate).href.replace(/^file:\/\//, 'vscode://file') + `:${targetLine}`;
    await shell.openExternal(vscodeUrl);
    return { opened: true };
  } catch {
    return { opened: false, error: 'The file could not be opened. Make sure it still exists and VS Code is installed.' };
  }
}

function startPackagedApi(): void {
  if (!app.isPackaged || apiProcess) return;

  const apiDirectory = join(process.resourcesPath, 'api');
  apiProcess = utilityProcess.fork(join(apiDirectory, 'dist', 'main.js'), [], {
    cwd: apiDirectory,
    env: {
      ...process.env,
      DEVELOPER_MEMORY_PACKAGED: 'true',
      DEVELOPER_MEMORY_API_PORT: String(apiPort),
      DEVELOPER_MEMORY_DEBUG: String(temporaryDeveloperMode),
    },
    stdio: 'pipe',
    serviceName: 'Developer Memory API',
  });
  apiProcess.stdout?.on('data', (chunk: Buffer) => console.log(`[API] ${chunk.toString().trimEnd()}`));
  apiProcess.stderr?.on('data', (chunk: Buffer) => console.error(`[API] ${chunk.toString().trimEnd()}`));
  apiProcess.once('exit', () => {
    apiProcess = null;
  });
}

async function isApiReady(): Promise<boolean> {
  try {
    const response = await fetch(apiHealthUrl, { signal: AbortSignal.timeout(1_000) });
    if (!response.ok) return false;

    const health = await response.json() as { status?: unknown };
    return health.status === 'ok';
  } catch {
    return false;
  }
}

async function waitForApi(timeoutMs = 15_000): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await isApiReady()) return;

    // The local API may need a moment to initialize its database.
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 150));
  }

  throw new Error('The local Developer Memory service did not start in time.');
}

async function ensureApiReady(): Promise<void> {
  if (!(await isApiReady())) startPackagedApi();
  await waitForApi();
}

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 780,
    minHeight: 560,
    title: 'Developer Memory',
    autoHideMenuBar: true,
    backgroundColor: windowBackground(),
    webPreferences: {
      preload: join(currentDirectory, 'preload.mjs'),
      contextIsolation: true,
      devTools: temporaryDeveloperMode || !app.isPackaged,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.webContents.on('before-input-event', (event, input) => {
    if (isReloadShortcut(input) || (!temporaryDeveloperMode && app.isPackaged && isDeveloperToolsShortcut(input))) {
      event.preventDefault();
    }
  });

  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  if (temporaryDeveloperMode) {
    window.webContents.once('did-finish-load', () => window.webContents.openDevTools({ mode: 'detach' }));
  }

  if (process.env.VITE_DEV_SERVER_URL) {
    void window.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    void window.loadFile(join(currentDirectory, '../dist/index.html'));
  }
}

function isReloadShortcut(input: Input): boolean {
  if (input.type !== 'keyDown') return false;

  const key = input.key.toLowerCase();
  return key === 'f5' || ((input.meta || input.control) && key === 'r');
}

function isDeveloperToolsShortcut(input: Input): boolean {
  if (input.type !== 'keyDown') return false;

  const key = input.key.toLowerCase();
  const modifiedDeveloperShortcut = (input.meta || input.control)
    && (input.alt || input.shift)
    && ['c', 'i', 'j'].includes(key);

  return key === 'f12' || modifiedDeveloperShortcut;
}

function configureApplicationMenu(): void {
  if (process.platform !== 'darwin') {
    Menu.setApplicationMenu(null);
    return;
  }

  const template: MenuItemConstructorOptions[] = [
    {
      label: applicationName,
      submenu: [
        { role: 'about', label: `About ${applicationName}` },
        { type: 'separator' },
        { role: 'quit', label: `Quit ${applicationName}` },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const window = BrowserWindow.getAllWindows()[0];
    if (!window) return;

    if (window.isMinimized()) window.restore();
    window.show();
    window.focus();
  });

  void app.whenReady().then(async () => {
    configureApplicationMenu();

    if (process.platform === 'darwin' && !app.isPackaged) {
      app.dock?.setIcon(join(currentDirectory, '../build/icon.png'));
    }

    try {
      await ensureApiReady();
    } catch {
      dialog.showErrorBox(
        'Developer Memory could not start',
        'The local project service did not become available. Close the app and try again.',
      );
      app.quit();
      return;
    }

    nativeTheme.on('updated', () => {
      for (const window of BrowserWindow.getAllWindows()) {
        window.setBackgroundColor(windowBackground());
      }
    });

    ipcMain.handle('desktop:select-project-directory', async () => {
      const result = await dialog.showOpenDialog({
        title: 'Select a project folder',
        properties: ['openDirectory'],
      });
      const path = result.filePaths[0];
      if (result.canceled || !path) return { canceled: true };

      selectedDirectories.add(path);
      return { canceled: false, path };
    });

    ipcMain.handle('desktop:detect-project', async (_event, path: unknown) => {
      if (typeof path !== 'string' || !selectedDirectories.has(path)) {
        throw new Error('Project detection is limited to a directory selected with the native picker');
      }
      selectedDirectories.delete(path);
      return detectProject(path);
    });

    ipcMain.handle('desktop:open-project-file', (_event, projectId: unknown, relativePath: unknown, line: unknown) =>
      openProjectFile(projectId, relativePath, line));

    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  apiProcess?.kill();
  apiProcess = null;
});

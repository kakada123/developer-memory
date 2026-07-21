import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { realpath, stat } from 'node:fs/promises';
import { detectProject } from './project-detection';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const selectedDirectories = new Set<string>();

interface RegisteredProjectResponse {
  path?: unknown;
}

function isInside(root: string, candidate: string): boolean {
  const pathFromRoot = relative(root, candidate);
  return pathFromRoot === ''
    || (!pathFromRoot.startsWith(`..${sep}`) && pathFromRoot !== '..' && !isAbsolute(pathFromRoot));
}

async function openProjectFile(projectId: unknown, relativePath: unknown, line: unknown) {
  if (typeof projectId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(projectId)) {
    return { opened: false, error: 'The project identifier is invalid.' };
  }
  if (typeof relativePath !== 'string' || !relativePath || isAbsolute(relativePath)) {
    return { opened: false, error: 'The file path is invalid.' };
  }

  try {
    const response = await fetch(`http://127.0.0.1:47821/projects/${encodeURIComponent(projectId)}`);
    if (!response.ok) return { opened: false, error: 'The registered project could not be found.' };
    const project = await response.json() as RegisteredProjectResponse;
    if (typeof project.path !== 'string') return { opened: false, error: 'The registered project path is invalid.' };

    const root = await realpath(project.path);
    const candidate = await realpath(resolve(root, relativePath));
    if (!isInside(root, candidate) || !(await stat(candidate)).isFile()) {
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

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 780,
    minHeight: 560,
    title: 'Developer Memory',
    backgroundColor: '#f6f7fb',
    webPreferences: {
      preload: join(currentDirectory, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    void window.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    void window.loadFile(join(currentDirectory, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

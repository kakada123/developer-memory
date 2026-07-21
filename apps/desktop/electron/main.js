import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { detectProject } from './project-detection';
const currentDirectory = dirname(fileURLToPath(import.meta.url));
const selectedDirectories = new Set();
function createWindow() {
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
    }
    else {
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
        if (result.canceled || !path)
            return { canceled: true };
        selectedDirectories.add(path);
        return { canceled: false, path };
    });
    ipcMain.handle('desktop:detect-project', async (_event, path) => {
        if (typeof path !== 'string' || !selectedDirectories.has(path)) {
            throw new Error('Project detection is limited to a directory selected with the native picker');
        }
        selectedDirectories.delete(path);
        return detectProject(path);
    });
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});

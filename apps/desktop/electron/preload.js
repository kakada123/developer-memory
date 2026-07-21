import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('desktop', {
    selectProjectDirectory: () => ipcRenderer.invoke('desktop:select-project-directory'),
    detectProject: (path) => ipcRenderer.invoke('desktop:detect-project', path),
});

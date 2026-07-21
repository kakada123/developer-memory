import { contextBridge, ipcRenderer } from 'electron';
import type { DetectedProject, DirectorySelection } from '@developer-memory/shared-types';

contextBridge.exposeInMainWorld('desktop', {
  selectProjectDirectory: (): Promise<DirectorySelection> => ipcRenderer.invoke('desktop:select-project-directory'),
  detectProject: (path: string): Promise<DetectedProject> => ipcRenderer.invoke('desktop:detect-project', path),
  openProjectFile: (projectId: string, relativePath: string, line?: number): Promise<{ opened: boolean; error?: string }> =>
    ipcRenderer.invoke('desktop:open-project-file', projectId, relativePath, line),
});

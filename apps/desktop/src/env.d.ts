/// <reference types="vite/client" />

import type { DetectedProject, DirectorySelection } from '@developer-memory/shared-types';

declare global {
  interface Window {
    desktop: {
      selectProjectDirectory(): Promise<DirectorySelection>;
      detectProject(path: string): Promise<DetectedProject>;
      openProjectFile(projectId: string, relativePath: string, line?: number): Promise<{ opened: boolean; error?: string }>;
    };
  }
}

export {};

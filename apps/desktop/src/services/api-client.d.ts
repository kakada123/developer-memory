import type { CreateProjectInput, IndexedFile, IndexedFileDetail, IndexProgress, IndexStatusResponse, Project, GitCommit, GitCommitFile, DevelopmentSession, MemoryEntry } from '@developer-memory/shared-types';
export declare class ApiError extends Error {
    readonly status: number;
    constructor(message: string, status: number);
}
export declare const apiClient: {
    listProjects: () => Promise<Project[]>;
    getProject: (id: string) => Promise<Project>;
    createProject: (input: CreateProjectInput) => Promise<Project>;
    deleteProject: (id: string) => Promise<void>;
    startIndex: (projectId: string) => Promise<IndexProgress>;
    getIndexStatus: (projectId: string) => Promise<IndexStatusResponse>;
    clearIndex: (projectId: string) => Promise<void>;
    listIndexedFiles: (projectId: string) => Promise<IndexedFile[]>;
    getIndexedFile: (projectId: string, fileId: string) => Promise<IndexedFileDetail>;
    startGitSync: (id: string) => Promise<unknown>;
    getGitStatus: (id: string) => Promise<{
        project: Project;
        progress: {
            status: string;
            percentage: number;
            message?: string;
        } | null;
        result: unknown;
    }>;
    listCommits: (id: string, search?: string) => Promise<{
        items: GitCommit[];
        total: number;
    }>;
    getCommit: (p: string, id: string) => Promise<GitCommit>;
    getCommitFiles: (p: string, id: string) => Promise<GitCommitFile[]>;
    listSessions: (id: string) => Promise<DevelopmentSession[]>;
    createSession: (id: string, input: {
        title: string;
        summary?: string;
    }) => Promise<DevelopmentSession>;
    sessionAction: (p: string, id: string, action: "pause" | "resume" | "complete") => Promise<DevelopmentSession>;
    deleteSession: (p: string, id: string) => Promise<void>;
    listMemories: (id: string) => Promise<MemoryEntry[]>;
    createMemory: (id: string, input: Partial<MemoryEntry> & Pick<MemoryEntry, "type" | "title" | "content">) => Promise<MemoryEntry>;
    memoryAction: (p: string, id: string, action: "resolve" | "archive") => Promise<MemoryEntry>;
};

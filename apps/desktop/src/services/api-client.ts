import type {
  CreateProjectInput, IndexedFile, IndexedFileDetail, IndexProgress, IndexStatusResponse, Project,
  GitCommit, GitCommitFile, DevelopmentSession, MemoryEntry,
} from '@developer-memory/shared-types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:47821';

interface ApiErrorPayload {
  message?: string | string[];
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError('Could not connect to the local Developer Memory service.', 0);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as ApiErrorPayload | null;
    const detail = Array.isArray(payload?.message) ? payload.message.join(', ') : payload?.message;
    throw new ApiError(detail ?? `Request failed with status ${response.status}`, response.status);
  }

  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

export const apiClient = {
  listProjects: (): Promise<Project[]> => request('/projects'),
  getProject: (id: string): Promise<Project> => request(`/projects/${encodeURIComponent(id)}`),
  createProject: (input: CreateProjectInput): Promise<Project> => request('/projects', {
    method: 'POST',
    body: JSON.stringify(input),
  }),
  deleteProject: (id: string): Promise<void> => request(`/projects/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  startIndex: (projectId: string): Promise<IndexProgress> => request(`/projects/${encodeURIComponent(projectId)}/index`, { method: 'POST' }),
  getIndexStatus: (projectId: string): Promise<IndexStatusResponse> => request(`/projects/${encodeURIComponent(projectId)}/index/status`),
  clearIndex: (projectId: string): Promise<void> => request(`/projects/${encodeURIComponent(projectId)}/index`, { method: 'DELETE' }),
  listIndexedFiles: (projectId: string): Promise<IndexedFile[]> => request(`/projects/${encodeURIComponent(projectId)}/files`),
  getIndexedFile: (projectId: string, fileId: string): Promise<IndexedFileDetail> =>
    request(`/projects/${encodeURIComponent(projectId)}/files/${encodeURIComponent(fileId)}`),
  startGitSync: (id:string) => request(`/projects/${id}/git/sync`,{method:'POST'}),
  getGitStatus: (id:string) => request<{project:Project;progress:{status:string;percentage:number;message?:string}|null;result:unknown}>(`/projects/${id}/git/status`),
  listGitBranches: (id:string) => request<{currentBranch:string|null;branches:string[];remoteDiscoveryFailed:boolean}>(`/projects/${id}/git/branches`),
  refreshGitBranches: (id:string) => request<{currentBranch:string|null;branches:string[];remoteDiscoveryFailed:boolean}>(`/projects/${id}/git/branches/refresh`,{method:'POST'}),
  switchGitBranch: (id:string,branch:string) => request<{branch:string;headHash:string}>(`/projects/${id}/git/switch`,{method:'POST',body:JSON.stringify({branch})}),
  listCommits: (id:string,search='') => request<{items:GitCommit[];total:number}>(`/projects/${id}/commits?search=${encodeURIComponent(search)}`),
  getCommit: (p:string,id:string) => request<GitCommit>(`/projects/${p}/commits/${id}`),
  getCommitFiles: (p:string,id:string) => request<GitCommitFile[]>(`/projects/${p}/commits/${id}/files`),
  listSessions: (id:string) => request<DevelopmentSession[]>(`/projects/${id}/sessions`),
  createSession: (id:string,input:{title:string;summary?:string}) => request<DevelopmentSession>(`/projects/${id}/sessions`,{method:'POST',body:JSON.stringify(input)}),
  sessionAction: (p:string,id:string,action:'pause'|'resume'|'complete') => request<DevelopmentSession>(`/projects/${p}/sessions/${id}/${action}`,{method:'POST'}),
  deleteSession: (p:string,id:string) => request<void>(`/projects/${p}/sessions/${id}`,{method:'DELETE'}),
  listMemories: (id:string) => request<MemoryEntry[]>(`/projects/${id}/memories`),
  createMemory: (id:string,input:Partial<MemoryEntry>&Pick<MemoryEntry,'type'|'title'|'content'>) => request<MemoryEntry>(`/projects/${id}/memories`,{method:'POST',body:JSON.stringify(input)}),
  memoryAction: (p:string,id:string,action:'resolve'|'archive') => request<MemoryEntry>(`/projects/${p}/memories/${id}/${action}`,{method:'POST'}),
};

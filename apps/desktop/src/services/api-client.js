const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:47821';
export class ApiError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}
async function request(path, init) {
    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...init,
            headers: { 'Content-Type': 'application/json', ...init?.headers },
        });
    }
    catch {
        throw new ApiError('Could not connect to the local Developer Memory service.', 0);
    }
    if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const detail = Array.isArray(payload?.message) ? payload.message.join(', ') : payload?.message;
        throw new ApiError(detail ?? `Request failed with status ${response.status}`, response.status);
    }
    return response.status === 204 ? undefined : response.json();
}
export const apiClient = {
    listProjects: () => request('/projects'),
    getProject: (id) => request(`/projects/${encodeURIComponent(id)}`),
    createProject: (input) => request('/projects', {
        method: 'POST',
        body: JSON.stringify(input),
    }),
    deleteProject: (id) => request(`/projects/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    startIndex: (projectId) => request(`/projects/${encodeURIComponent(projectId)}/index`, { method: 'POST' }),
    getIndexStatus: (projectId) => request(`/projects/${encodeURIComponent(projectId)}/index/status`),
    clearIndex: (projectId) => request(`/projects/${encodeURIComponent(projectId)}/index`, { method: 'DELETE' }),
    listIndexedFiles: (projectId) => request(`/projects/${encodeURIComponent(projectId)}/files`),
    getIndexedFile: (projectId, fileId) => request(`/projects/${encodeURIComponent(projectId)}/files/${encodeURIComponent(fileId)}`),
    startGitSync: (id) => request(`/projects/${id}/git/sync`, { method: 'POST' }),
    getGitStatus: (id) => request(`/projects/${id}/git/status`),
    listCommits: (id, search = '') => request(`/projects/${id}/commits?search=${encodeURIComponent(search)}`),
    getCommit: (p, id) => request(`/projects/${p}/commits/${id}`),
    getCommitFiles: (p, id) => request(`/projects/${p}/commits/${id}/files`),
    listSessions: (id) => request(`/projects/${id}/sessions`),
    createSession: (id, input) => request(`/projects/${id}/sessions`, { method: 'POST', body: JSON.stringify(input) }),
    sessionAction: (p, id, action) => request(`/projects/${p}/sessions/${id}/${action}`, { method: 'POST' }),
    deleteSession: (p, id) => request(`/projects/${p}/sessions/${id}`, { method: 'DELETE' }),
    listMemories: (id) => request(`/projects/${id}/memories`),
    createMemory: (id, input) => request(`/projects/${id}/memories`, { method: 'POST', body: JSON.stringify(input) }),
    memoryAction: (p, id, action) => request(`/projects/${p}/memories/${id}/${action}`, { method: 'POST' }),
};

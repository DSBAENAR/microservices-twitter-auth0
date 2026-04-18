const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }

  if (res.status === 204) return null;
  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : res.text();
}

export const api = {
  getStream: (page = 0, size = 20) => request(`/api/stream?page=${page}&size=${size}`),
  getPosts: (page = 0, size = 20) => request(`/api/posts?page=${page}&size=${size}`),
  createPost: (content, token) => request('/api/posts', { method: 'POST', body: { content }, token }),
  getMe: (token) => request('/api/me', { token }),
};

const rawBackendUrl =
  process.env.REACT_APP_BACKEND_APP_URL ||
  process.env.REACT_BACKEND_APP_URL ||
  'http://localhost:5000';

export const BACKEND_URL = rawBackendUrl.replace(/\/$/, '');
export const GROQ_CHATBOT_API =
  process.env.REACT_APP_GROQ_CHATBOT_API ||
  process.env.GROQ_CHATBOT_API ||
  '';
export const BACKEND_API_KEY =
  process.env.REACT_APP_BACKEND_API_KEY ||
  process.env.BACKEND_API_KEY ||
  '';

export function apiUrl(path = '') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_URL}${normalizedPath}`;
}

export function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});

  if (BACKEND_API_KEY) {
    headers.set('x-api-key', BACKEND_API_KEY);
  }

  return fetch(apiUrl(path), {
    ...options,
    headers,
  });
}

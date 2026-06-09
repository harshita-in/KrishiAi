const rawBackendUrl =
  process.env.REACT_APP_BACKEND_APP_URL ||
  process.env.REACT_BACKEND_APP_URL ||
  'http://localhost:5000';

export const BACKEND_URL = rawBackendUrl.replace(/\/$/, '');

export function apiUrl(path = '') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_URL}${normalizedPath}`;
}

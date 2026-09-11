const rawBackendUrl =
  process.env.REACT_APP_BACKEND_APP_URL ||
  'http://localhost:5000';

const formattedUrl = rawBackendUrl.trim().startsWith('http')
  ? rawBackendUrl.trim()
  : `https://${rawBackendUrl.trim()}`;

export const BACKEND_URL = formattedUrl.replace(/\/$/, '');
export const BACKEND_API_KEY =
  process.env.REACT_APP_BACKEND_API_KEY ||
  '';

export function apiUrl(path = '') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_URL}${normalizedPath}`;
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});

  if (BACKEND_API_KEY) {
    headers.set('x-api-key', BACKEND_API_KEY);
  }

  const res = await fetch(apiUrl(path), {
    ...options,
    headers,
  });

  const originalJson = res.json.bind(res);
  res.json = async () => {
    try {
      return await originalJson();
    } catch {
      throw new Error(`Server returned ${res.status} non-JSON response`);
    }
  };

  return res;
}

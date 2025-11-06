import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/lib/constants/auth';

const isBrowser = typeof window !== 'undefined';

const handleUnauthorized = () => {
  if (!isBrowser) return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  if (!window.location.pathname.startsWith('/auth')) {
    window.location.href = '/auth/login';
  }
};

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  const headers = new Headers(init?.headers);

  if (!headers.has('Content-Type') && !(init?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (isBrowser) {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('No autorizado');
  }

  return response;
}

export async function apiFetchJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await apiFetch(input, init);
  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  let data: unknown = undefined;
  if (isJson && response.status !== 204 && response.status !== 205) {
    try {
      data = await response.json();
    } catch (error) {
      // Ignore JSON parse errors for empty bodies when not expected
      data = undefined;
    }
  }

  if (!response.ok) {
    const message =
      (typeof data === 'object' && data !== null && 'message' in data
        ? (data as { message?: string }).message
        : undefined) || response.statusText || 'Solicitud fallida';

    const error = new Error(message);
    if (typeof data === 'object' && data !== null && 'details' in data) {
      (error as Error & { details?: unknown }).details = (data as { details?: unknown }).details;
    }
    throw error;
  }

  return data as T;
}

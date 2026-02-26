const rawApiBase = (import.meta.env.VITE_API_BASE_URL || '').trim();
const normalizedApiBase = rawApiBase.replace(/\/+$/, '');

function withApiBase(path: string): string {
  if (!normalizedApiBase) {
    return path;
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedApiBase}${normalizedPath}`;
}

export const API_ENDPOINTS = {
  auth: withApiBase('/php/auth.php'),
  blog: withApiBase('/php/blog.php'),
  chat: withApiBase('/php/chat.php'),
  contact: withApiBase('/php/contact.php'),
  orders: withApiBase('/api/orders.php'),
  paymentCheckout: withApiBase('/api/payment/checkout.php'),
} as const;

export const AUTH_STORAGE_KEY = 'cvk_auth_v1';
export const LEGACY_AUTH_STORAGE_KEY = 'token';
export const USER_STORAGE_KEY = 'cvk_user_v1';

export function getAuthToken(): string {
  return localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(LEGACY_AUTH_STORAGE_KEY) || '';
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_STORAGE_KEY, token);
  localStorage.setItem(LEGACY_AUTH_STORAGE_KEY, token);
}

export function clearAuthStorage(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

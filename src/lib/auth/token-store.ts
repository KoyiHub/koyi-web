const ACCESS_KEY = 'koyi.auth.access';
const REFRESH_KEY = 'koyi.auth.refresh';

/**
 * Single place auth tokens are read from and written to, so swapping storage
 * touches one file. SimpleJWT issues an access/refresh pair on login, and
 * logout/refresh need the refresh token too, so both are tracked here.
 *
 * Note: `localStorage` is readable by any script on the origin, so it is a
 * poor home for long-lived tokens. Prefer httpOnly cookies for refresh
 * tokens in a future revisit; this is the narrow extension the current
 * single-token store supports today.
 */
let inMemoryAccess: string | null = null;
let inMemoryRefresh: string | null = null;

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Private mode / storage disabled — fall back to memory-only auth.
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore: the in-memory copy still carries this session.
  }
}

function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}

export function getAuthToken(): string | null {
  if (inMemoryAccess) return inMemoryAccess;
  inMemoryAccess = readStorage(ACCESS_KEY);
  return inMemoryAccess;
}

export function getRefreshToken(): string | null {
  if (inMemoryRefresh) return inMemoryRefresh;
  inMemoryRefresh = readStorage(REFRESH_KEY);
  return inMemoryRefresh;
}

export function setAuthTokens(tokens: { access: string; refresh: string }): void {
  inMemoryAccess = tokens.access;
  inMemoryRefresh = tokens.refresh;
  writeStorage(ACCESS_KEY, tokens.access);
  writeStorage(REFRESH_KEY, tokens.refresh);
}

export function clearAuthToken(): void {
  inMemoryAccess = null;
  inMemoryRefresh = null;
  removeStorage(ACCESS_KEY);
  removeStorage(REFRESH_KEY);
}

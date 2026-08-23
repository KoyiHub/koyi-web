const STORAGE_KEY = 'koyi.auth.token';

/**
 * Single place the access token is read from and written to, so swapping
 * storage (memory-only, cookie, in-memory + refresh) touches one file.
 *
 * Note: `localStorage` is readable by any script on the origin, so it is a poor
 * home for long-lived tokens. Prefer httpOnly cookies for refresh tokens and
 * keep only a short-lived access token here.
 */
let inMemoryToken: string | null = null;

export function getAuthToken(): string | null {
  if (inMemoryToken) return inMemoryToken;

  try {
    inMemoryToken = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private mode / storage disabled — fall back to memory-only auth.
    inMemoryToken = null;
  }

  return inMemoryToken;
}

export function setAuthToken(token: string): void {
  inMemoryToken = token;
  try {
    window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Ignore: the in-memory copy still carries this session.
  }
}

export function clearAuthToken(): void {
  inMemoryToken = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}

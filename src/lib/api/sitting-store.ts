const SESSION_KEY = 'koyi.sitting.session';
const EXPIRES_KEY = 'koyi.sitting.expires';

/**
 * The session string a child holds for one assessment sitting.
 *
 * Deliberately separate from `@/lib/auth/token-store`. This is a **capability,
 * not an identity**: holding it permits exactly one assignment and nothing
 * else. It is not a JWT, it is never sent in `Authorization`, it is never
 * refreshed, and it belongs to a child who has no account at all.
 *
 * The two stores also have different lifecycles — signing a teacher out must
 * not end a child's sitting on a shared classroom tablet, and a sitting
 * expiring must not touch anyone's tokens.
 *
 * `sessionStorage`, not `localStorage`: a sitting belongs to one tab. Closing
 * it should not leave a live capability behind on a device that is handed to
 * the next child.
 */

let inMemorySession: string | null = null;
let inMemoryExpires: string | null = null;

function read(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    // Private mode / storage disabled — the in-memory copy still carries the tab.
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Ignore: the sitting survives in memory for as long as the tab lives.
  }
}

function remove(key: string): void {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}

export function getSittingSession(): string | null {
  inMemorySession ??= read(SESSION_KEY);
  return inMemorySession;
}

/** When the server said this sitting stops working. ISO-8601, or `null`. */
export function getSittingExpiry(): string | null {
  inMemoryExpires ??= read(EXPIRES_KEY);
  return inMemoryExpires;
}

export function setSitting(sitting: { session: string; expires_at: string }): void {
  inMemorySession = sitting.session;
  inMemoryExpires = sitting.expires_at;
  write(SESSION_KEY, sitting.session);
  write(EXPIRES_KEY, sitting.expires_at);
}

export function clearSitting(): void {
  inMemorySession = null;
  inMemoryExpires = null;
  remove(SESSION_KEY);
  remove(EXPIRES_KEY);
}

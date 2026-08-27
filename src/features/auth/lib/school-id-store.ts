const SCHOOL_ID_KEY = 'koyi.auth.schoolId';

/**
 * Remembers the School ID a teacher last signed in with, so the second and
 * every later sign-in arrives with the field already filled. Teachers share
 * devices in a staff room, so the value is only ever a prefilled default —
 * the field stays visible and editable, and nothing here authenticates
 * anyone. A School ID is not a secret and not a credential.
 *
 * Kept separate from `@/lib/auth/token-store` on purpose: signing out clears
 * tokens, but the remembered School ID is a convenience that should survive
 * it.
 */
export function getRememberedSchoolId(): string | null {
  try {
    return window.localStorage.getItem(SCHOOL_ID_KEY);
  } catch {
    // Private mode / storage disabled — the field simply starts empty.
    return null;
  }
}

export function rememberSchoolId(schoolId: string): void {
  try {
    window.localStorage.setItem(SCHOOL_ID_KEY, schoolId);
  } catch {
    // Ignore: prefilling is a convenience, never a requirement.
  }
}

export function forgetSchoolId(): void {
  try {
    window.localStorage.removeItem(SCHOOL_ID_KEY);
  } catch {
    // Ignore.
  }
}

import { useCallback, useState } from 'react';

export type OnboardingRole = 'teacher' | 'admin';

const STORAGE_KEY = 'koyi_onboarding_role';

function readStoredRole(): OnboardingRole | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored === 'admin' || stored === 'teacher' ? stored : null;
  } catch {
    return null;
  }
}

/**
 * Frontend-only onboarding role selection, backed by sessionStorage so it
 * survives navigation between Role Selection and Features. No stored/valid
 * role resolves to `null` rather than silently defaulting to a role — callers
 * on routes that require a role (e.g. Features) must redirect back to Role
 * Selection instead of guessing. No backend endpoint exists for onboarding
 * state, so this never leaves the tab.
 */
export function useOnboardingRole() {
  const [role, setRoleState] = useState<OnboardingRole | null>(readStoredRole);

  const setRole = useCallback((next: OnboardingRole) => {
    setRoleState(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, next);
    } catch {
      // sessionStorage unavailable (private mode etc.) — in-memory state still works.
    }
  }, []);

  return { role, setRole };
}

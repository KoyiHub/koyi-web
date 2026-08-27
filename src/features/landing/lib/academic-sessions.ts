import type { SelectOption } from '@/components/ui/select-field';

/** How many sessions to offer either side of the current one. */
const SPAN = 2;

/** A Nigerian academic session runs across two calendar years, e.g. "2026/2027". */
export function sessionLabel(startYear: number): string {
  return `${String(startYear)}/${String(startYear + 1)}`;
}

/**
 * The session a school is most likely in right now. Nigerian sessions start
 * around September, so before September the current session is still the one
 * that began the previous calendar year.
 */
export function currentSessionStartYear(now: Date = new Date()): number {
  const year = now.getFullYear();
  return now.getMonth() >= 8 ? year : year - 1;
}

/**
 * Session choices for the school setup form: the current session plus two
 * either side, so a school registering late or planning ahead is covered
 * without an open-ended year list.
 */
export function academicSessionOptions(now: Date = new Date()): SelectOption[] {
  const current = currentSessionStartYear(now);
  return Array.from({ length: SPAN * 2 + 1 }, (_, index) => {
    const label = sessionLabel(current - SPAN + index);
    return { value: label, label };
  });
}

/** Pre-selected value for the session dropdown. */
export function currentSessionValue(now: Date = new Date()): string {
  return sessionLabel(currentSessionStartYear(now));
}

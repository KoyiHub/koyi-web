/**
 * What steps 5 and 6 need to know about the school created in step 4.
 *
 * It travels in the router's `location.state` rather than a store: the value
 * belongs to this one navigation, and a refresh legitimately loses it — at
 * which point the step sends the visitor back to set-up instead of showing a
 * verification box for a school it cannot name.
 */
export interface SchoolJourneyState {
  schoolId: string;
  schoolName: string;
  schoolEmail: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Narrows an untyped `location.state` to the journey payload, or `null`. */
export function readJourneyState(state: unknown): SchoolJourneyState | null {
  if (!isRecord(state)) return null;

  const { schoolId, schoolName, schoolEmail } = state;
  if (
    typeof schoolId !== 'string' ||
    typeof schoolName !== 'string' ||
    typeof schoolEmail !== 'string'
  ) {
    return null;
  }

  return { schoolId, schoolName, schoolEmail };
}

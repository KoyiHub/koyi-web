/**
 * What steps 5 and 6 need to know about the school created in step 4.
 *
 * It travels in the router's `location.state` rather than a store: the value
 * belongs to this one navigation, and a refresh legitimately loses it — at
 * which point the step sends the visitor back to set-up instead of showing a
 * verification box for a school it cannot name.
 *
 * Built from the step-4 form values directly, not from the register
 * response — `frontend-integration.md`'s register response is just
 * `{id, email, otp_sent}`, so the school's name is never echoed back.
 */
export interface SchoolJourneyState {
  name: string;
  email: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Narrows an untyped `location.state` to the journey payload, or `null`. */
export function readJourneyState(state: unknown): SchoolJourneyState | null {
  if (!isRecord(state)) return null;

  const { name, email } = state;
  if (typeof name !== 'string' || typeof email !== 'string') return null;

  return { name, email };
}

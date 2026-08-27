/**
 * PROVISIONAL school-onboarding endpoints.
 *
 * No confirmed Django/OpenAPI contract exists for school registration yet, so
 * these paths are served by MSW handlers in development and are NOT verified
 * against the backend. They live in one file on purpose: when the real
 * contract lands, this is the only place that changes — the mutation hooks and
 * every screen that uses them stay exactly as they are.
 */
export const schoolOnboardingEndpoints = {
  register: '/v1/schools/register/',
  verifyEmail: '/v1/schools/verify-email/',
  resendVerification: '/v1/schools/verify-email/resend/',
} as const;

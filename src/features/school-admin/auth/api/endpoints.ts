/**
 * School Admin auth URLs. PROVISIONAL — the School Portal backend code exists
 * but is not wired into public API URLs yet (confirmed via repo audit), so
 * none of these is a confirmed contract. MSW answers them in development (see
 * `src/mocks/handlers.ts`); a build without mocks will fail against them
 * loudly rather than pretending to sign anyone in.
 *
 * Request bodies use snake_case to match the confirmed Django auth
 * serializers; revisit if the real contract differs.
 */
export const provisionalSchoolAdminAuthEndpoints = {
  login: '/v1/auth/school-admin/login/',
  verifyDevice: '/v1/auth/school-admin/verify-device/',
} as const;

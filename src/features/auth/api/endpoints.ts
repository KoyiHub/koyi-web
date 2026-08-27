/**
 * Auth endpoint URLs in one place, split by how certain we are of them.
 *
 * `authEndpoints` are confirmed against the Django `apps.users` URLs.
 *
 * `provisionalAuthEndpoints` are NOT confirmed. Koyi signs teachers in with a
 * Teacher ID + School ID pair, which has no published contract yet — MSW
 * answers it in development (see `src/mocks/handlers.ts`). It is isolated
 * here so that swapping to the real API is a change of URL and
 * request/response schema in this folder, never a change to a screen. The
 * School Admin equivalents live in
 * `@/features/school-admin/auth/api/endpoints`.
 *
 * Request bodies use snake_case to match the confirmed Django auth
 * serializers (`first_name`, `password_confirm`); revisit if the real
 * contract differs.
 */
export const authEndpoints = {
  register: '/v1/auth/register/',
  logout: '/v1/auth/logout/',
  refresh: '/v1/auth/token/refresh/',
  me: '/v1/auth/me/',
} as const;

export const provisionalAuthEndpoints = {
  teacherLogin: '/v1/auth/teacher/login/',
} as const;

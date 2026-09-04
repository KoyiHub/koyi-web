/**
 * Shared auth endpoint URLs.
 *
 * Logout and token refresh are the only two auth paths both surfaces share;
 * everything else is grouped **surface first** (`/v1/teacher/auth/…`,
 * `/v1/school/auth/…`) so permissions, routing and the OpenAPI tags line up.
 *
 * There is no register endpoint here: teachers do not self-register. A school
 * admin creates a teacher account, which is what ties the login to a school.
 */
export const authEndpoints = {
  logout: '/v1/auth/logout/',
  refresh: '/v1/auth/token/refresh/',
} as const;

/**
 * Teacher auth. A teacher signs in with the **teacher id** the school issued
 * them — e.g. `GHS-T-00007` — not an email: it carries the school abbreviation
 * as a prefix and is globally unique, so no separate school field is needed.
 */
export const teacherAuthEndpoints = {
  login: '/v1/teacher/auth/login/',
  me: '/v1/teacher/auth/me/',
  changePassword: '/v1/teacher/auth/password/change/',
  resetPasswordRequest: '/v1/teacher/auth/password/reset/request/',
  resetPasswordConfirm: '/v1/teacher/auth/password/reset/confirm/',
} as const;

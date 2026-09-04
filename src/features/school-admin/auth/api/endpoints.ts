/**
 * School management auth.
 *
 * Registration and login are both two-step behind an emailed OTP, so each has
 * a `verify` counterpart. The password-reset *request* step always returns
 * `200` whether or not the address exists — so the form says "if that address
 * is registered, a code is on its way", never "code sent", which would let the
 * form be used to discover which schools have accounts.
 */
export const schoolAuthEndpoints = {
  register: '/v1/school/auth/register/',
  registerVerify: '/v1/school/auth/register/verify/',
  login: '/v1/school/auth/login/',
  loginVerify: '/v1/school/auth/login/verify/',
  otpResend: '/v1/school/auth/otp/resend/',
  resetPasswordRequest: '/v1/school/auth/password/reset/request/',
  resetPasswordVerify: '/v1/school/auth/password/reset/verify/',
  resetPasswordConfirm: '/v1/school/auth/password/reset/confirm/',
} as const;

/**
 * The public school-onboarding journey.
 *
 * These are the school auth endpoints reached from the landing pages rather
 * than a separate surface — `/get-started` registers, `/verify-email` is the
 * registration OTP step. Re-exported from one place so the landing feature does
 * not reach into the school-admin feature for a URL.
 */
export { schoolAuthEndpoints } from '@/features/school-admin/auth/api/endpoints';

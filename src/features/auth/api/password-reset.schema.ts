import { z } from 'zod';

/**
 * Teacher password reset — `frontend-integration.md` §5.1. Two steps,
 * **link/token based**, not the school admin's OTP-code flow
 * (`@/features/school-admin/auth/api/password-reset.schema.ts`): a request
 * emails a link carrying a token, and there is no separate code-entry page
 * — the teacher lands on a "set new password" page with the token already
 * in the URL.
 */
export const requestTeacherPasswordResetResponseSchema = z.unknown();

export const confirmTeacherPasswordResetResponseSchema = z.unknown();

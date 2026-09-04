import { z } from 'zod';

/**
 * School Admin settings — `frontend-integration.md` §4.2. The real profile
 * is `{name, logo, current_session}` plus the read-only `abbreviation` —
 * see `@/features/school-admin/api/shared.schema`'s `schoolSchema`. There
 * is no documented endpoint for an administrator's own identity (name,
 * phone, 2FA) separate from the school record — the "Account & Security"
 * tab this used to back was removed for having no anchor at all.
 */
export const passwordChangeResponseSchema = z.object({
  detail: z.string(),
});

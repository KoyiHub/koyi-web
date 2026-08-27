import { z } from 'zod';

/** Accepted logo formats and size cap, shared by the schema and the drop field. */
export const LOGO_ACCEPT = 'image/png,image/jpeg,image/svg+xml';
export const LOGO_MAX_BYTES = 2 * 1024 * 1024;

/**
 * School setup (journey step 4). The field list is fixed by the product brief:
 * school name, school email, school logo, password, class system, current
 * session. Anything else shown in the design reference is deliberately out.
 *
 * The logo is optional — a school should never be blocked from registering
 * because it has no image file to hand; it can be added later in settings.
 */
export const schoolSetupSchema = z.object({
  schoolName: z.string().trim().min(2, 'Enter your school name'),
  schoolEmail: z
    .string()
    .trim()
    .min(1, 'School email is required')
    .email('Enter a valid email address'),
  schoolLogo: z
    .instanceof(File, { message: 'Upload a PNG, JPG or SVG file' })
    .refine((file) => file.size <= LOGO_MAX_BYTES, 'Logo must be 2MB or smaller')
    .nullable(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must include a letter')
    .regex(/\d/, 'Password must include a number'),
  classSystem: z.enum(['grade', 'primary'], { message: 'Choose a class system' }),
  currentSession: z.string().min(1, 'Select the current session'),
});

export type SchoolSetupFormValues = z.infer<typeof schoolSetupSchema>;

/** Email verification (journey step 5). */
export const VERIFICATION_CODE_LENGTH = 6;

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .length(VERIFICATION_CODE_LENGTH, `Enter the ${String(VERIFICATION_CODE_LENGTH)}-digit code`)
    .regex(/^\d+$/, 'The code is digits only'),
});

export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

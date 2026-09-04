import { z } from 'zod';

/**
 * School setup (journey step 4) — `frontend-integration.md` §4.1's register
 * body, field for field: name, abbreviation, email, password (+ confirm),
 * class system. The logo and the current session are **not** part of
 * registration in the guide — logo has no confirmed upload mechanism
 * anywhere, and the session is set later in school settings (§4.2) once the
 * admin is signed in, sourced from `/v1/school/sessions/`.
 */
export const schoolSetupSchema = z
  .object({
    schoolName: z.string().trim().min(2, 'Enter your school name'),
    schoolEmail: z
      .string()
      .trim()
      .min(1, 'School email is required')
      .email('Enter a valid email address'),
    /**
     * 2–12 uppercase letters/digits, globally unique, and becomes the prefix
     * of every student and teacher id this school ever issues. It cannot be
     * changed afterwards — the form says so.
     */
    abbreviation: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{2,12}$/, '2–12 letters or numbers, no spaces or symbols'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must include a letter')
      .regex(/\d/, 'Password must include a number'),
    passwordConfirm: z.string().min(1, 'Confirm your password'),
    classSystem: z.enum(['grade', 'primary'], { message: 'Choose a class system' }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
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

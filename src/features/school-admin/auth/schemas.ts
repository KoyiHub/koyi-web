import { z } from 'zod';

/**
 * School Admin auth validation (Fresh PDF pages 6-7). No confirmed backend
 * contract exists for School Admin accounts yet — see the mutation stubs in
 * `api/mutations.ts` — so these schemas describe form shape only.
 */
export const schoolAdminSignupSchema = z
  .object({
    schoolName: z.string().min(1, 'School name is required'),
    administratorName: z.string().min(1, 'Administrator name is required'),
    email: z.string().min(1, 'Email address is required').email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SchoolAdminSignupFormValues = z.infer<typeof schoolAdminSignupSchema>;

export const schoolAdminLoginSchema = z.object({
  email: z.string().min(1, 'Email address is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type SchoolAdminLoginFormValues = z.infer<typeof schoolAdminLoginSchema>;

export const DEVICE_CODE_LENGTH = 6;

/** One-time code entered when the backend does not recognise the device. */
export const schoolAdminVerifyDeviceSchema = z.object({
  code: z
    .string()
    .length(DEVICE_CODE_LENGTH, `Enter the ${String(DEVICE_CODE_LENGTH)}-digit code`)
    .regex(/^\d+$/, 'The code is digits only'),
});

export type SchoolAdminVerifyDeviceFormValues = z.infer<typeof schoolAdminVerifyDeviceSchema>;

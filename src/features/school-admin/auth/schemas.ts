import { z } from 'zod';

/**
 * School Admin sign-in and device-check form validation —
 * `frontend-integration.md` §4.1. Admin accounts are created through the
 * public onboarding journey (`@/features/landing`), not a signup form here.
 */
export const schoolAdminLoginSchema = z.object({
  email: z.string().min(1, 'Email address is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SchoolAdminLoginFormValues = z.infer<typeof schoolAdminLoginSchema>;

export const DEVICE_CODE_LENGTH = 6;

/** One-time code entered when the backend requires an OTP. */
export const schoolAdminVerifyDeviceSchema = z.object({
  code: z
    .string()
    .length(DEVICE_CODE_LENGTH, `Enter the ${String(DEVICE_CODE_LENGTH)}-digit code`)
    .regex(/^\d+$/, 'The code is digits only'),
});

export type SchoolAdminVerifyDeviceFormValues = z.infer<typeof schoolAdminVerifyDeviceSchema>;

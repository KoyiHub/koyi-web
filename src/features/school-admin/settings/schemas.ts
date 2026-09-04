import { z } from 'zod';

/**
 * Settings form validation.
 *
 * Only the fields a school administrator may change are modelled here.
 * Read-only server facts (role, email verification, abbreviation,
 * class_system) are displayed but never submitted.
 */

export const schoolProfileSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  address: z.string().min(1, 'Address is required'),
  location: z.string().min(1, 'Location is required'),
  motto: z.string(),
  currentSessionId: z.string().min(1, 'Select the current session'),
});
export type SchoolProfileFormValues = z.infer<typeof schoolProfileSchema>;

export const adminAccountFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  twoFactorEnabled: z.boolean(),
});
export type AdminAccountFormValues = z.infer<typeof adminAccountFormSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm the new password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

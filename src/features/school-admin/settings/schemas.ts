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
  currentSessionId: z.string().min(1, 'Select the current session'),
});
export type SchoolProfileFormValues = z.infer<typeof schoolProfileSchema>;

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

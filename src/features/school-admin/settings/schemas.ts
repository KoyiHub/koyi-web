import { z } from 'zod';

/**
 * Settings form validation.
 *
 * Only the fields a school administrator may change are modelled here.
 * Read-only server facts (role, email verification, `class_system`, grade
 * levels) are displayed but never submitted.
 */

export const schoolProfileSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  address: z.string().min(1, 'Address is required'),
  location: z.string().min(1, 'Location is required'),
  motto: z.string(),
});
export type SchoolProfileFormValues = z.infer<typeof schoolProfileSchema>;

export const academicSettingsFormSchema = z
  .object({
    currentSession: z.string().min(1, 'Session is required'),
    currentTerm: z.string().min(1, 'Term is required'),
    termStartsOn: z.string().min(1, 'Start date is required'),
    termEndsOn: z.string().min(1, 'End date is required'),
    assessmentWindowWeeks: z
      .number({ message: 'Enter a number of weeks' })
      .min(1, 'At least 1 week')
      .max(12, 'At most 12 weeks')
      .refine((weeks) => Number.isInteger(weeks), 'Enter a whole number of weeks'),
    autoAssignBaseline: z.boolean(),
  })
  .refine((values) => values.termEndsOn >= values.termStartsOn, {
    message: 'The term must end after it starts',
    path: ['termEndsOn'],
  });
export type AcademicSettingsFormValues = z.infer<typeof academicSettingsFormSchema>;

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

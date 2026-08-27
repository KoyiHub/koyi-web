import { z } from 'zod';

/**
 * Validation only — no API contract exists yet, so these schemas describe
 * the shape of the local mock submit flow, not a confirmed backend payload.
 */
export const teacherLoginSchema = z.object({
  teacherId: z.string().trim().min(1, 'Teacher ID is required'),
  schoolId: z.string().trim().min(1, 'School ID is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type TeacherLoginFormValues = z.infer<typeof teacherLoginSchema>;

export const signupSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().min(1, 'Email address is required').email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

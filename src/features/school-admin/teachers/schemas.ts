import { z } from 'zod';

/**
 * Add Teacher form validation. Fields are limited to what the backend
 * direction supports: a linked Django User (first/last name, email, password)
 * plus a class relationship. `teacher_id` is backend-generated — never
 * collected here.
 */
export const addTeacherSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  classId: z.string().min(1, 'Select a class'),
});

export type AddTeacherFormValues = z.infer<typeof addTeacherSchema>;

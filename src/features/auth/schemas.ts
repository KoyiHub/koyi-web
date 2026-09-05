import { z } from 'zod';

/**
 * Teacher sign-in form validation.
 *
 * One identifier, not two: the teacher id carries the school abbreviation as a
 * prefix and is globally unique, so asking for a school as well would be asking
 * the teacher to repeat themselves.
 */
export const teacherLoginSchema = z.object({
  teacherId: z.string().trim().min(1, 'Teacher ID is required'),
  password: z.string().min(1, 'Password is required'),
});

export type TeacherLoginFormValues = z.infer<typeof teacherLoginSchema>;

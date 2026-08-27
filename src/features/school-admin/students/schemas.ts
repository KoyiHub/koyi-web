import { z } from 'zod';

import { GUARDIAN_RELATIONSHIPS } from '@/features/school-admin/students/api/student.schema';

/**
 * Add Student form validation. Deliberately has no email/password fields —
 * students do not own a Django User login account. `studentId` is optional
 * because the server generates one when it is left blank.
 */
export const addStudentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Select a gender'),
  classId: z.string().min(1, 'Select a class'),
  studentId: z.string(),
  guardianName: z.string().min(1, 'Guardian name is required'),
  guardianPhone: z.string().min(1, 'Guardian phone number is required'),
  guardianRelationship: z.enum(GUARDIAN_RELATIONSHIPS, {
    message: 'Select guardian relationship',
  }),
  triggerBaselineAssessment: z.boolean(),
});

export type AddStudentFormValues = z.infer<typeof addStudentSchema>;

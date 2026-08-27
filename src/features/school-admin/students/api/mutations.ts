import { useMutation, useQueryClient } from '@tanstack/react-query';

import { schoolAdminEndpoints } from '@/features/school-admin/api/endpoints';
import { schoolAdminKeys } from '@/features/school-admin/api/queries';
import { studentDetailSchema } from '@/features/school-admin/students/api/student.schema';
import { api } from '@/lib/api/client';

export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  classId: string;
  dateOfBirth: string;
  gender: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelationship: string;
  /** Optional — the server generates one when left blank. */
  studentId?: string;
  /** Queues a baseline diagnostic for the new student. */
  triggerBaselineAssessment?: boolean;
}

/**
 * Enrols a student. Students have no login credentials of their own — no
 * email or password is collected — so this creates a school record only.
 */
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStudentInput) =>
      api.post(schoolAdminEndpoints.students.list, studentDetailSchema, {
        first_name: input.firstName,
        last_name: input.lastName,
        class_id: input.classId,
        date_of_birth: input.dateOfBirth,
        gender: input.gender,
        guardian_name: input.guardianName,
        guardian_phone: input.guardianPhone,
        guardian_relationship: input.guardianRelationship,
        student_id: input.studentId ?? '',
        trigger_baseline_assessment: input.triggerBaselineAssessment ?? false,
      }),
    onSuccess: async () => {
      // Class rosters and the dashboard headline count both move.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: schoolAdminKeys.students() }),
        queryClient.invalidateQueries({ queryKey: schoolAdminKeys.classes() }),
      ]);
    },
  });
}

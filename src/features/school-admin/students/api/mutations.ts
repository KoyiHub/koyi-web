import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

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
  /** Optional — many guardians won't have one. Where an assessment link is sent. */
  guardianEmail?: string | undefined;
  guardianRelationship: string;
  /** Queues a baseline diagnostic for the new student. */
  triggerBaselineAssessment?: boolean;
}

/**
 * Enrols a student — `frontend-integration.md` §4.5. Students have no login
 * credentials of their own — no email or password is collected — and
 * `student_id` is never sent: it is always server-generated, shown on
 * success with a copy control.
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
        guardian_email:
          input.guardianEmail === undefined || input.guardianEmail === ''
            ? null
            : input.guardianEmail,
        guardian_relationship: input.guardianRelationship,
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

function invalidateStudent(queryClient: ReturnType<typeof useQueryClient>, studentId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: schoolAdminKeys.studentDetail(studentId) }),
    queryClient.invalidateQueries({ queryKey: schoolAdminKeys.students() }),
  ]);
}

export function useDisableStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) =>
      api.post(schoolAdminEndpoints.students.disable(studentId), studentDetailSchema),
    onSuccess: (_data, studentId) => invalidateStudent(queryClient, studentId),
  });
}

export function useEnableStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) =>
      api.post(schoolAdminEndpoints.students.enable(studentId), studentDetailSchema),
    onSuccess: (_data, studentId) => invalidateStudent(queryClient, studentId),
  });
}

/** Two-step delete behind an emailed 2FA code — `frontend-integration.md` §4.5. */
export function useRequestStudentDelete() {
  return useMutation({
    mutationFn: (studentId: string) =>
      api.post(
        schoolAdminEndpoints.students.deleteRequest(studentId),
        z.object({ sent: z.boolean() }),
      ),
  });
}

export function useConfirmStudentDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { studentId: string; code: string }) =>
      api.post(schoolAdminEndpoints.students.deleteConfirm(input.studentId), z.unknown(), {
        code: input.code,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: schoolAdminKeys.students() });
    },
  });
}

const transferResultSchema = z.object({ transferred: z.number() });

/** Multi-select mode — `POST /v1/school/students/transfer/`, §4.5. */
export function useTransferStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { studentIds: string[]; toClass: string }) =>
      api.post(schoolAdminEndpoints.students.transfer, transferResultSchema, {
        student_ids: input.studentIds,
        to_class: input.toClass,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: schoolAdminKeys.students() }),
        queryClient.invalidateQueries({ queryKey: schoolAdminKeys.classes() }),
      ]);
    },
  });
}

/** Whole-class mode — `POST /v1/school/students/transfer-class/`, §4.5. */
export function useTransferClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { fromClass: string; toClass: string }) =>
      api.post(schoolAdminEndpoints.students.transferClass, transferResultSchema, {
        from_class: input.fromClass,
        to_class: input.toClass,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: schoolAdminKeys.students() }),
        queryClient.invalidateQueries({ queryKey: schoolAdminKeys.classes() }),
      ]);
    },
  });
}

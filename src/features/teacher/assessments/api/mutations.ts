import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { teacherEndpoints } from '@/features/teacher/api/endpoints';
import { teacherKeys } from '@/features/teacher/api/queries';
import { assessmentStatusSchema } from '@/features/teacher/api/shared.schema';
import { createdAssessmentSchema } from '@/features/teacher/assessments/api/assessment.schema';
import type { AssessmentDraft, DraftQuestion } from '@/features/teacher/assessments/lib/draft';
import { api } from '@/lib/api/client';

/**
 * Turns one draft question into the payload the API expects.
 *
 * Two things the client does not decide: `order` and the ids. `display_order`
 * is sent as the position the teacher arranged the blocks into, and the server
 * is free to renumber. A question that came from the bank is sent as a bare
 * `id` reference — re-sending its whole body would let a stale copy in this
 * tab overwrite the canonical one.
 */
function toQuestionPayload(question: DraftQuestion) {
  if (question.source === 'bank') {
    return { id: question.id, point: question.point, layout: question.layout };
  }

  return {
    text: question.text,
    description: question.description || null,
    subject: question.subject,
    level: question.level,
    point: question.point,
    question_type: question.question_type,
    layout: question.layout,
    contents: question.contents.map((content, index) => ({
      type: content.type,
      display_order: index + 1,
      text_content: content.type === 'text' ? content.text_content : null,
      // PROVISIONAL: no upload endpoint is confirmed, so the file name stands
      // in for the media id. See the note in `lib/draft.ts`.
      media_name: content.media_name || null,
      alt_text: content.alt_text || null,
      caption: content.caption || null,
    })),
    options: question.options.map((option) => ({
      value: option.value,
      type: option.type,
      media_name: option.media_name || null,
      is_correct: option.is_correct,
    })),
    answer_value: question.options.length === 0 ? question.answer_value : null,
  };
}

/**
 * Creates the assessment the builder has been holding in `sessionStorage`.
 *
 * Always lands as a draft: publishing is a separate decision made at the
 * assign step, so a half-scheduled assessment can never reach a child.
 */
export function useCreateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draft: AssessmentDraft) =>
      api.post(teacherEndpoints.assessments.list, createdAssessmentSchema, {
        title: draft.details.title,
        description: draft.details.description,
        subject: draft.details.subject,
        assessment_type: draft.details.assessment_type,
        difficulty: draft.details.difficulty,
        grade_level: draft.details.grade_level,
        instructions: draft.details.instructions || null,
        time_limit_minutes: draft.details.time_limit_minutes || null,
        questions: draft.questions.map(toQuestionPayload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teacherKeys.assessments() });
    },
  });
}

/** What the server reports back after scheduling. */
const assignResultSchema = z.object({
  id: z.string(),
  status: assessmentStatusSchema,
  assigned_count: z.number(),
});

export interface AssignAssessmentInput {
  assessmentId: string;
  studentIds: string[];
  /** ISO datetimes. Both are optional while the teacher is only saving a draft. */
  startsAt: string | null;
  deadline: string | null;
  timeLimitMinutes: number | null;
  /** `true` keeps it a draft: nothing opens for the children. */
  saveAsDraft: boolean;
}

/**
 * Schedules an assessment and picks who sits it.
 *
 * The server validates the window and the student list — the same rules must
 * hold for a request that never came from this form, so the client's checks
 * are a courtesy, not the gate.
 */
export function useAssignAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignAssessmentInput) =>
      api.post(teacherEndpoints.assessments.assign(input.assessmentId), assignResultSchema, {
        student_ids: input.studentIds,
        starts_at: input.startsAt,
        deadline: input.deadline,
        time_limit_minutes: input.timeLimitMinutes,
        save_as_draft: input.saveAsDraft,
      }),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: teacherKeys.assessments() }),
        queryClient.invalidateQueries({ queryKey: teacherKeys.assessmentDetail(result.id) }),
      ]);
    },
  });
}

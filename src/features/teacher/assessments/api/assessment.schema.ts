import { z } from 'zod';

import {
  assessmentQuestionSchema,
  assessmentStatusSchema,
  assessmentSubjectSchema,
  assessmentTypeSchema,
  paginatedSchema,
  performanceBandSchema,
  questionLayoutSchema,
  questionTypeSchema,
  studentSummarySchema,
} from '@/features/teacher/api/shared.schema';

/**
 * PROVISIONAL Teacher assessment contracts — see `../../api/endpoints.ts`.
 *
 * SECURITY BOUNDARY: nothing in this module carries a correct answer, an
 * `is_correct` flag, or a scoring rule. Student-facing screens run in the same
 * browser, so answer keys never leave the server. Scores arrive already
 * computed; bands arrive already assigned.
 */

/** Difficulty is a teaching label, not a scoring input, so the client may filter on it. */
export const difficultySchema = z.enum(['foundation', 'core', 'stretch']);
export type Difficulty = z.infer<typeof difficultySchema>;

/** A card in the assessment library. */
export const assessmentSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  subject: assessmentSubjectSchema,
  assessment_type: assessmentTypeSchema,
  status: assessmentStatusSchema,
  difficulty: difficultySchema,
  grade_label: z.string(),
  grade_level: z.number(),
  question_count: z.number(),
  /** Minutes. `null` when the assessment is untimed. */
  time_limit_minutes: z.number().nullable(),
  assigned_count: z.number(),
  completed_count: z.number(),
  updated_at: z.string(),
  updated_label: z.string(),
});
export type AssessmentSummary = z.infer<typeof assessmentSummarySchema>;

export const assessmentListSchema = paginatedSchema(assessmentSummarySchema).extend({
  /** Tab counts come from the server so they stay right across pages. */
  tab_counts: z.object({
    all: z.number(),
    literacy: z.number(),
    numeracy: z.number(),
    drafts: z.number(),
  }),
});
export type AssessmentList = z.infer<typeof assessmentListSchema>;

/* -------------------------------------------------------------------------- */
/* Assessment detail                                                          */
/* -------------------------------------------------------------------------- */

/** One class-wide skill row on the detail screen. */
export const detailSkillSchema = z.object({
  id: z.string(),
  skill: z.string(),
  average_score: z.number(),
  students_below_benchmark: z.number(),
});

/** One child's result. `score` is server-computed; the client only formats it. */
export const studentResultSchema = z.object({
  student_id: z.string(),
  full_name: z.string(),
  student_code: z.string(),
  status: z.enum(['completed', 'in_progress', 'not_started']),
  /** Percentage, or `null` while the child has not finished. */
  score: z.number().nullable(),
  band: performanceBandSchema.nullable(),
  /** Server-authored, e.g. "18 of 20". */
  correct_label: z.string().nullable(),
  time_taken_label: z.string().nullable(),
  submitted_at: z.string().nullable(),
});
export type StudentResult = z.infer<typeof studentResultSchema>;

export const assessmentDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  subject: assessmentSubjectSchema,
  assessment_type: assessmentTypeSchema,
  status: assessmentStatusSchema,
  difficulty: difficultySchema,
  grade_label: z.string(),
  class_name: z.string(),
  question_count: z.number(),
  total_points: z.number(),
  time_limit_minutes: z.number().nullable(),
  /** ISO-8601; `null` while the assessment is still a draft. */
  scheduled_for: z.string().nullable(),
  deadline: z.string().nullable(),
  window_label: z.string().nullable(),
  metrics: z.object({
    class_average: z.number(),
    class_average_change: z.number(),
    completion_rate: z.number(),
    completed_count: z.number(),
    assigned_count: z.number(),
    average_time_label: z.string(),
    /** Children whose result puts them below the benchmark for this assessment. */
    needs_attention: z.number(),
  }),
  skills: z.array(detailSkillSchema),
  learning_levels: z.array(
    z.object({
      band: performanceBandSchema,
      label: z.string(),
      students: z.number(),
      percentage: z.number(),
      /** What this band means for the teacher's next lesson. */
      guidance: z.string(),
    }),
  ),
  results: z.array(studentResultSchema),
});
export type AssessmentDetail = z.infer<typeof assessmentDetailSchema>;

/* -------------------------------------------------------------------------- */
/* Assessment analytics                                                       */
/* -------------------------------------------------------------------------- */

export const analyticsSchema = z.object({
  id: z.string(),
  title: z.string(),
  class_name: z.string(),
  completed_label: z.string(),
  class_average: z.number(),
  class_average_change: z.number(),
  class_average_caption: z.string(),
  participation_rate: z.number(),
  participation_caption: z.string(),
  /** Score buckets, e.g. "0-20%" … "81-100%". */
  score_distribution: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      students: z.number(),
      percentage: z.number(),
      band: performanceBandSchema,
    }),
  ),
  skill_performance: z.array(
    z.object({
      id: z.string(),
      skill: z.string(),
      average_score: z.number(),
      change: z.number(),
    }),
  ),
  most_missed: z.array(
    z.object({
      question_id: z.string(),
      order: z.number(),
      text: z.string(),
      question_type: questionTypeSchema,
      skill: z.string(),
      /** Share of children who answered incorrectly. Computed server-side. */
      miss_rate: z.number(),
      /** What the wrong answers had in common, in plain words. No answer key. */
      common_error: z.string(),
    }),
  ),
  /** Narrative the teacher can act on, generated with the report. */
  trends: z.array(
    z.object({
      id: z.string(),
      tone: z.enum(['positive', 'watch', 'action']),
      headline: z.string(),
      body: z.string(),
    }),
  ),
});
export type AssessmentAnalytics = z.infer<typeof analyticsSchema>;

/* -------------------------------------------------------------------------- */
/* Builder lookups and drafts                                                 */
/* -------------------------------------------------------------------------- */

/** The `QuestionLayout` lookup table, with copy the builder shows beside each name. */
export const questionLayoutOptionSchema = z.object({
  id: z.string(),
  name: questionLayoutSchema,
  label: z.string(),
  description: z.string(),
});
export type QuestionLayoutOption = z.infer<typeof questionLayoutOptionSchema>;

export const questionLayoutListSchema = z.object({
  count: z.number(),
  results: z.array(questionLayoutOptionSchema),
});

/** Students the builder can assign to, with the level pill the design shows. */
export const assignableStudentSchema = studentSummarySchema.extend({
  level_label: z.string(),
});
export type AssignableStudent = z.infer<typeof assignableStudentSchema>;

/** Echo of a created assessment. The server owns ids, ordering and timestamps. */
export const createdAssessmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: assessmentStatusSchema,
  question_count: z.number(),
  questions: z.array(assessmentQuestionSchema),
});
export type CreatedAssessment = z.infer<typeof createdAssessmentSchema>;

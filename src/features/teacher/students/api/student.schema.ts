import { z } from 'zod';

import {
  assessmentSubjectSchema,
  learningLevelSchema,
  paginatedSchema,
  performanceBandSchema,
  questionTypeSchema,
  studentSummarySchema,
} from '@/features/teacher/api/shared.schema';

/**
 * PROVISIONAL Teacher student contracts — see `../../api/endpoints.ts`.
 *
 * SECURITY BOUNDARY: the question log below reports what a child answered and
 * how the server graded it. It never carries the expected answer or an
 * `is_correct` flag per option — the student assessment app runs in this same
 * browser. Whether a teacher-only "expected answer" field should exist is an
 * open question for the backend team; until it is answered deliberately, this
 * client does not ask for one.
 */

/** A row in the student directory. */
export const studentRowSchema = studentSummarySchema.extend({
  level_label: z.string(),
  /** Latest overall percentage, or `null` for a child with no completed assessment. */
  latest_score: z.number().nullable(),
  last_assessed: z.string().nullable(),
  last_assessed_label: z.string(),
  /** Short server-authored summary of the child's biggest gap, or `null`. */
  primary_gap: z.string().nullable(),
  needs_attention: z.boolean(),
});
export type StudentRow = z.infer<typeof studentRowSchema>;

export const studentListSchema = paginatedSchema(studentRowSchema).extend({
  level_counts: z.object({
    all: z.number(),
    strong: z.number(),
    intermediate: z.number(),
    struggling: z.number(),
    beginner: z.number(),
  }),
});
export type StudentList = z.infer<typeof studentListSchema>;

/* -------------------------------------------------------------------------- */
/* Learning profile                                                           */
/* -------------------------------------------------------------------------- */

/** One skill inside a subject breakdown. */
export const profileSkillSchema = z.object({
  id: z.string(),
  skill: z.string(),
  score: z.number(),
  band: performanceBandSchema,
  band_label: z.string(),
  /** Percentage points since the previous assessment; negative means a drop. */
  change: z.number(),
});
export type ProfileSkill = z.infer<typeof profileSkillSchema>;

export const subjectBreakdownSchema = z.object({
  subject: assessmentSubjectSchema,
  label: z.string(),
  overall_score: z.number(),
  band: performanceBandSchema,
  band_label: z.string(),
  skills: z.array(profileSkillSchema),
});
export type SubjectBreakdown = z.infer<typeof subjectBreakdownSchema>;

/** One attempted question, as reviewed after the fact. */
export const questionLogEntrySchema = z.object({
  id: z.string(),
  assessment_id: z.string(),
  assessment_title: z.string(),
  question_text: z.string(),
  question_type: questionTypeSchema,
  subject: assessmentSubjectSchema,
  skill: z.string(),
  /** What the child gave, as the server recorded it. Text, a chosen label, or a filename. */
  response: z.string(),
  /** Server-graded outcome. The client renders it; it never decides it. */
  outcome: z.enum(['correct', 'incorrect', 'partial', 'skipped']),
  points_awarded: z.number(),
  points_possible: z.number(),
  time_taken_label: z.string(),
  answered_at: z.string(),
});
export type QuestionLogEntry = z.infer<typeof questionLogEntrySchema>;

export const learningProfileSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  student_code: z.string(),
  class_name: z.string(),
  age: z.number(),
  avatar_url: z.string().nullable(),
  level: learningLevelSchema,
  level_label: z.string(),
  overall_score: z.number(),
  overall_change: z.number(),
  assessments_taken: z.number(),
  last_assessed_label: z.string(),
  strengths: z.array(z.string()),
  learning_gaps: z.array(z.string()),
  breakdown: z.array(subjectBreakdownSchema),
  /** Narrative generated with the latest report, quoted verbatim by the UI. */
  interpretation: z.object({
    generated_label: z.string(),
    summary: z.string(),
    evidence: z.array(z.string()),
    confidence: z.enum(['high', 'medium', 'low']),
  }),
  next_steps: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      detail: z.string(),
      /** How soon it matters — drives ordering and the pill colour. */
      urgency: z.enum(['now', 'this_week', 'this_term']),
      skill: z.string(),
    }),
  ),
  history: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      date_label: z.string(),
      score: z.number(),
      band: performanceBandSchema,
    }),
  ),
  question_log: z.array(questionLogEntrySchema),
});
export type LearningProfile = z.infer<typeof learningProfileSchema>;

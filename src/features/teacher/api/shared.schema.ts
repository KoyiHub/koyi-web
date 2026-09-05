import {
  assessmentStatusSchema,
  assessmentSubjectSchema,
  assessmentTypeSchema,
  learningLevelSchema,
  paginatedSchema,
  performanceBandSchema,
} from '@/lib/api/contracts';

/**
 * Shapes shared across every Teacher resource.
 *
 * The question-shape enums (question type, layout, content/option type) and
 * the media/content/option schemas used to be duplicated here — a dead,
 * conflicting copy of `@/lib/api/contracts`'s real ones (the layout enum
 * here was even uppercase-keyed, the wrong casing). Removed outright:
 * every live consumer already imports the correct versions straight from
 * `@/lib/api/contracts`.
 */

export {
  assessmentStatusSchema,
  assessmentSubjectSchema,
  assessmentTypeSchema,
  learningLevelSchema,
  paginatedSchema,
  performanceBandSchema,
};
export type {
  AssessmentStatus,
  AssessmentSubject,
  AssessmentType,
  LearningLevel,
  PaginatedResult,
  PerformanceBand,
} from '@/lib/api/contracts';

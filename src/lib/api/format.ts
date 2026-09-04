import type {
  AssessmentStatus,
  AssessmentSubject,
  AssessmentType,
  AssignmentStatus,
  LearningLevel,
  PerformanceBand,
} from '@/lib/api/contracts';

/**
 * Portal-neutral presentation helpers.
 *
 * These map values the *server already decided* onto words and colours. No
 * band or level is derived here — a score never becomes a band in the browser.
 *
 * Lives in `lib` rather than in a feature because both applications render the
 * same FLN vocabulary; each portal re-exports from here and adds its own.
 */

const dateFormatter = new Intl.DateTimeFormat('en-NG', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

/** Formats an ISO date (or datetime) as "18 Aug 2026". Falls back to the raw value. */
export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? iso : dateFormatter.format(parsed);
}

export const BAND_LABEL: Record<PerformanceBand, string> = {
  strong: 'Strong',
  intermediate: 'Intermediate',
  struggling: 'Struggling',
};

export const LEVEL_LABEL: Record<LearningLevel, string> = {
  ...BAND_LABEL,
  beginner: 'Not yet assessed',
};

/** Pill classes for a band chip. Soft tint + the matching solid text colour. */
export const BAND_CHIP_CLASS: Record<PerformanceBand, string> = {
  strong: 'bg-koyi-band-strong-soft text-koyi-band-strong-ink',
  intermediate: 'bg-koyi-band-intermediate-soft text-koyi-band-intermediate-ink',
  struggling: 'bg-koyi-band-struggling-soft text-koyi-band-struggling-ink',
};

export const LEVEL_CHIP_CLASS: Record<LearningLevel, string> = {
  ...BAND_CHIP_CLASS,
  beginner: 'bg-koyi-nav-active text-koyi-muted',
};

/** Fill colour for a band's progress bar. */
export const BAND_BAR_CLASS: Record<PerformanceBand, string> = {
  strong: 'bg-koyi-band-strong',
  intermediate: 'bg-koyi-band-intermediate',
  struggling: 'bg-koyi-band-struggling',
};

export const SUBJECT_LABEL: Record<AssessmentSubject, string> = {
  literacy: 'Literacy',
  numeracy: 'Numeracy',
};

export const ASSESSMENT_TYPE_LABEL: Record<AssessmentType, string> = {
  baseline: 'Baseline',
  midline: 'Midline',
  endline: 'Endline',
  practice: 'Practice',
};

/**
 * Where a paper is in its life. `published` is the currently-open-for-
 * sitting state; `closed` follows from `closes_at`, decided server-side —
 * these are labels for a value that arrived, nothing here computes a window.
 */
export const ASSESSMENT_STATUS_LABEL: Record<AssessmentStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  closed: 'Closed',
};

export const ASSESSMENT_STATUS_CLASS: Record<AssessmentStatus, string> = {
  draft: 'bg-koyi-nav-active text-koyi-muted',
  published: 'bg-koyi-band-strong-soft text-koyi-band-strong-ink',
  closed: 'bg-koyi-nav-active text-koyi-text',
};

/** One child's progress through one paper — `not_started → in_progress → finished → graded`. */
export const ASSIGNMENT_STATUS_LABEL: Record<AssignmentStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  finished: 'Finished',
  graded: 'Graded',
};

export const ASSIGNMENT_STATUS_CLASS: Record<AssignmentStatus, string> = {
  not_started: 'bg-koyi-nav-active text-koyi-muted',
  in_progress: 'bg-koyi-band-intermediate-soft text-koyi-primary',
  finished: 'bg-koyi-band-strong-soft text-koyi-band-strong-ink',
  graded: 'bg-koyi-band-strong-soft text-koyi-band-strong-ink',
};

import type {
  AssessmentStatus,
  AssessmentSubject,
  AssessmentType,
  LearningLevel,
  PerformanceBand,
} from '@/features/school-admin/api/shared.schema';

/**
 * Presentation helpers shared by the School Admin screens.
 *
 * These map values the *server already decided* onto words and colours. No
 * band or level is derived here — a score never becomes a band in the browser.
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

export const ASSESSMENT_STATUS_LABEL: Record<AssessmentStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  active: 'Active',
  completed: 'Completed',
};

export const ASSESSMENT_STATUS_CLASS: Record<AssessmentStatus, string> = {
  draft: 'bg-koyi-nav-active text-koyi-muted',
  scheduled: 'bg-koyi-band-intermediate-soft text-koyi-primary',
  active: 'bg-koyi-band-strong-soft text-koyi-band-strong-ink',
  completed: 'bg-koyi-nav-active text-koyi-text',
};

/**
 * The shape of the library's filter dialog, and the choices it offers.
 *
 * Kept beside the dialog rather than inside it so the library page can read the
 * applied filters and count them without importing a component.
 */

export interface AssessmentFilters {
  difficulty: string;
  subject: string;
  status: string;
  grade: string;
}

export const SUBJECT_OPTIONS = [
  { value: 'all', label: 'Every subject' },
  { value: 'literacy', label: 'Literacy' },
  { value: 'numeracy', label: 'Numeracy' },
];

export const STATUS_OPTIONS = [
  { value: 'all', label: 'Any status' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

export const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'Any difficulty' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'core', label: 'Core' },
  { value: 'stretch', label: 'Stretch' },
];

export const GRADE_OPTIONS = [
  { value: 'all', label: 'Every grade' },
  { value: '1', label: 'Primary 1' },
  { value: '2', label: 'Primary 2' },
  { value: '3', label: 'Primary 3' },
  { value: '4', label: 'Primary 4' },
  { value: '5', label: 'Primary 5' },
  { value: '6', label: 'Primary 6' },
];

export const NO_FILTERS: AssessmentFilters = {
  difficulty: 'all',
  subject: 'all',
  status: 'all',
  grade: 'all',
};

/** How many filters are actually narrowing the list. Drives the button's badge. */
export function activeFilterCount(filters: AssessmentFilters): number {
  return Object.values(filters).filter((value) => value !== 'all').length;
}

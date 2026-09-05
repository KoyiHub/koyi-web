/**
 * School Admin presentation helpers.
 *
 * The FLN vocabulary is shared with the Teacher app, so it lives in
 * `@/lib/api/format` and is re-exported here. Call sites keep importing from
 * this path; anything genuinely School-Admin-only is added below.
 */

export {
  ASSESSMENT_STATUS_CLASS,
  ASSESSMENT_STATUS_LABEL,
  ASSESSMENT_TYPE_LABEL,
  BAND_BAR_CLASS,
  BAND_CHIP_CLASS,
  BAND_LABEL,
  formatDate,
  LEVEL_CHIP_CLASS,
  LEVEL_LABEL,
  SUBJECT_LABEL,
} from '@/lib/api/format';

/** Computed client-side from `date_of_birth` — §4.5's student shape has no `age` field. */
export function ageFromDob(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    now.getMonth() > dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

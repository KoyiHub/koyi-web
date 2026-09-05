import type { InsightKind } from '@/features/teacher/dashboard/api/dashboard.schema';

/**
 * Teacher presentation helpers.
 *
 * The FLN vocabulary shared with the School Admin app lives in
 * `@/lib/api/format` and is re-exported here so a screen imports one module.
 * Everything added below is Teacher-only.
 *
 * Nothing here derives a band, a score or a grade — these map values the
 * server already decided onto words and colours.
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

const timeFormatter = new Intl.DateTimeFormat('en-NG', {
  hour: 'numeric',
  minute: '2-digit',
});

/** Formats an ISO datetime as "9:12 AM". Falls back to an em dash. */
export function formatTime(iso: string | null): string {
  if (!iso) return '—';
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? '—' : timeFormatter.format(parsed);
}

/** "+6" / "−3" / "0". Uses a real minus sign so figures line up in a column. */
export function formatChange(change: number): string {
  if (change > 0) return `+${String(change)}`;
  if (change < 0) return `−${String(Math.abs(change))}`;
  return '0';
}

/*
 * DEPRECATED: the question-vocabulary labels (question type, layout,
 * content/option type) that used to live here read off a dead, conflicting
 * duplicate of `@/lib/api/contracts`'s enums that `@/features/teacher/api/
 * shared.schema` no longer exports. The live authoring form
 * (`question-form-panel.tsx`) already defines its own correct, lowercase-
 * keyed labels and never imported these. Removed rather than fixed in
 * place: nothing outside this file referenced them.
 *
 * DEPRECATED: difficulty (foundation/core/stretch) and bank status
 * (production_ready/needs_review/retired) do not exist in the new contract —
 * questions carry `fln_level` instead, and the bank is read-only with no
 * status field. Removed rather than kept as dead exports: nothing outside
 * this file referenced either.
 *
 * DEPRECATED: `PRIORITY_LABEL`/`PRIORITY_CHIP_CLASS` backed the dashboard's
 * priority-ranked attention list, which had no doc anchor — the attention
 * page is now scoped per-assessment off `analytics/roster/` (§5.5), which
 * carries no priority concept at all.
 */

/* -------------------------------------------------------------------------- */
/* Dashboard drill-downs — activity/insights have no doc anchor and are     */
/* left exactly as built per an explicit scope decision (refactor-plan.md). */
/* -------------------------------------------------------------------------- */

export const INSIGHT_KIND_LABEL: Record<InsightKind, string> = {
  emerging_gap: 'Emerging gap',
  common_mistake: 'Common mistake',
  teaching_activity: 'Teaching activity',
  positive_trend: 'Positive trend',
};

export const ACTIVITY_TYPE_LABEL: Record<string, string> = {
  assessment_completed: 'Assessment completed',
  assessment_assigned: 'Assessment assigned',
  student_flagged: 'Student flagged',
  group_updated: 'Group updated',
  report_exported: 'Report exported',
  insight_generated: 'Insight generated',
};

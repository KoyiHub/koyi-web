import { PlaceholderPage } from '@/components/ui/placeholder-page';

/**
 * Assessment analytics — `frontend-integration.md` §5.5, §7.4. Scoped to
 * Phase 4 of the refactor (results, analytics, review), which follows the
 * runner and the assignment flow.
 *
 * Built there, not stubbed with old data here, because analytics has real
 * invariants worth getting right in one pass: `level_distribution` as the
 * headline rather than an average, `marking_status` shown wherever figures
 * are shown (marking runs in two passes), and a narrative that is `null`-safe
 * throughout.
 */
export function AssessmentAnalyticsPage() {
  return (
    <PlaceholderPage
      title="Assessment Analytics"
      description="Level distribution, the skill × level matrix and the AI narrative land in the results phase of the FLN refactor."
    />
  );
}

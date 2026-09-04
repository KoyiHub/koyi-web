import { PlaceholderPage } from '@/components/ui/placeholder-page';

/**
 * Assigning a published paper to students — `frontend-integration.md` §5.4,
 * §7.4. Scoped to Phase 3 of the refactor (assignment, roster, guardian
 * links), which follows the authoring workspace built in Phase 1.
 *
 * The mutations this page will call already exist and are real —
 * `useAssignStudents`, `useWithdrawAssignment`, `useSendGuardianLink(s)` in
 * `@/features/teacher/assessments/api/mutations` — so this page is a pure UI
 * gap, not a missing contract.
 */
export function AssignAssessmentPage() {
  return (
    <PlaceholderPage
      title="Assign Assessment"
      description="Assigning to classes or individual students, the printable code roster, and sending guardian links land in the next phase of the FLN refactor."
    />
  );
}

import { PlaceholderPage } from '@/components/ui/placeholder-page';

/**
 * Sidebar destinations that are deliberately not built yet.
 *
 * Both links sit in `teacherNav`, so without a route they would resolve to the
 * shell's 404 — a dead link in the primary navigation reads as a bug. These
 * stand in until the designs land; no product UI belongs here.
 */

export function TeacherSettingsPage() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Teacher settings are waiting on their design. Nothing here yet."
    />
  );
}

export function TeacherHelpPage() {
  return <PlaceholderPage title="Help" description="The teacher help centre isn't built yet." />;
}

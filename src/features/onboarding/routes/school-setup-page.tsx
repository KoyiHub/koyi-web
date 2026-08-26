import { PlaceholderPage } from '@/components/ui/placeholder-page';

/**
 * School Admin's onboarding destination (Fresh PDF page 4). Not built this
 * batch — Koyi web is teacher-only today and no School Admin flow exists
 * anywhere else in the app, so this only needs to resolve, not function.
 */
export function SchoolSetupPage() {
  return (
    <div className="bg-koyi-surface flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <PlaceholderPage
          title="School setup"
          description="School Admin onboarding isn't built yet — Koyi web is teacher-first for now."
        />
      </div>
    </div>
  );
}

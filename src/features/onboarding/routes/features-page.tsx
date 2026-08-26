import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { ClipboardIcon, GraduationCapIcon, TrendingUpIcon, UsersIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { useOnboardingRole } from '@/features/onboarding/hooks/use-onboarding-role';
import { destinationForRole } from '@/features/onboarding/lib/destination-for-role';

const FEATURES = [
  {
    Icon: ClipboardIcon,
    title: 'Assess',
    description: 'Run quick, structured literacy and numeracy checks with every student.',
  },
  {
    Icon: UsersIcon,
    title: 'Group',
    description: 'Organise students into classes and groups that match how you teach.',
  },
  {
    Icon: GraduationCapIcon,
    title: 'Teach',
    description: 'See where each learner is stuck and act on it in the next lesson.',
  },
  {
    Icon: TrendingUpIcon,
    title: 'Track',
    description: 'Watch progress build across the term with a clear, class-wide picture.',
  },
];

/**
 * Fresh PDF page 3: feature overview. Continue and Skip both resolve to the
 * same role-aware destination — Skip just gets there faster, it doesn't skip
 * to a different place.
 */
export function FeaturesPage() {
  const navigate = useNavigate();
  const { role } = useOnboardingRole();

  // No silent default: direct/refreshed access without a valid selected role
  // must send the teacher back to choose one, not assume School Teacher.
  useEffect(() => {
    if (role === null) {
      void navigate(paths.onboarding.role, { replace: true });
    }
  }, [role, navigate]);

  function handleContinue() {
    if (role === null) return;
    void navigate(destinationForRole(role));
  }

  if (role === null) {
    return null;
  }

  return (
    <div className="bg-koyi-surface flex min-h-dvh flex-col">
      <header className="border-koyi-border bg-koyi-card border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="text-koyi-primary text-lg font-semibold tracking-tight">Koyi</span>
          <button
            type="button"
            onClick={handleContinue}
            className="text-koyi-muted text-sm font-medium hover:underline"
          >
            Skip
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6">
        <p className="text-koyi-primary text-sm font-semibold tracking-wide uppercase">
          Step 3 of 5
        </p>
        <h1 className="text-koyi-text mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need to understand your learners
        </h1>
        <p className="text-koyi-muted mt-3 max-w-lg text-base">
          Koyi brings assessment, grouping, teaching and progress tracking into one place.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map(({ Icon, title, description }) => (
            <div key={title} className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-5">
              <span className="bg-koyi-surface text-koyi-primary rounded-koyi-md inline-flex size-10 items-center justify-center">
                <Icon />
              </span>
              <h2 className="text-koyi-text mt-4 text-base font-semibold">{title}</h2>
              <p className="text-koyi-muted mt-1 text-sm">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => void navigate(paths.onboarding.role)}
            className="text-koyi-primary text-sm font-medium hover:underline"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="bg-koyi-primary hover:bg-koyi-primary-hover rounded-md px-4 py-3 text-center text-sm font-medium text-white transition-colors"
          >
            Continue
          </button>
        </div>
      </main>
    </div>
  );
}

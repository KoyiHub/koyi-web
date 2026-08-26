import { useNavigate } from 'react-router';

import { BuildingIcon, UsersIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import {
  type OnboardingRole,
  useOnboardingRole,
} from '@/features/onboarding/hooks/use-onboarding-role';
import { destinationForRole } from '@/features/onboarding/lib/destination-for-role';

const ROLE_OPTIONS: {
  role: OnboardingRole;
  label: string;
  description: string;
  Icon: typeof BuildingIcon;
}[] = [
  {
    role: 'admin',
    label: 'School Admin',
    description: 'Set up your school, manage teachers and oversee results across classes.',
    Icon: BuildingIcon,
  },
  {
    role: 'teacher',
    label: 'School Teacher',
    description: 'Assess your students, track learning gaps and monitor class progress.',
    Icon: UsersIcon,
  },
];

/**
 * Fresh PDF page 2: "How will you use Koyi?" — role selection. School
 * Teacher is pre-selected since Koyi web is teacher-first today. The choice
 * is stored via `useOnboardingRole` (sessionStorage, no backend) so it
 * survives the trip to the Features page.
 */
export function RoleSelectionPage() {
  const navigate = useNavigate();
  const { role, setRole } = useOnboardingRole();
  // School Teacher is the visible pre-selected radio (teacher-first product),
  // but it's only committed to storage once the user leaves this page —
  // Features must never receive a role the user didn't see selected.
  const displayRole = role ?? 'teacher';

  function handleContinue() {
    setRole(displayRole);
    void navigate(paths.onboarding.features);
  }

  function handleSkip() {
    setRole(displayRole);
    void navigate(destinationForRole(displayRole));
  }

  return (
    <div className="bg-koyi-surface flex min-h-dvh flex-col">
      <header className="border-koyi-border bg-koyi-card border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="text-koyi-primary text-lg font-semibold tracking-tight">Koyi</span>
          <button
            type="button"
            onClick={handleSkip}
            className="text-koyi-muted text-sm font-medium hover:underline"
          >
            Skip
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <p className="text-koyi-primary text-sm font-semibold tracking-wide uppercase">
          Step 2 of 5
        </p>
        <h1 className="text-koyi-text mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          How will you use Koyi?
        </h1>
        <p className="text-koyi-muted mt-3 max-w-md text-base">
          Choose the role that fits you best. You can always confirm this later — nothing here is
          final yet.
        </p>

        <div role="radiogroup" aria-label="How will you use Koyi?" className="mt-8 space-y-3">
          {ROLE_OPTIONS.map(({ role: optionRole, label, description, Icon }) => {
            const selected = displayRole === optionRole;
            return (
              <button
                key={optionRole}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setRole(optionRole)}
                className={`rounded-koyi-lg flex w-full items-start gap-4 border p-5 text-left transition-colors ${
                  selected
                    ? 'border-koyi-primary bg-koyi-primary/5'
                    : 'border-koyi-border bg-koyi-card hover:border-koyi-accent'
                }`}
              >
                <span
                  className={`rounded-koyi-md flex size-10 shrink-0 items-center justify-center ${
                    selected ? 'bg-koyi-primary text-white' : 'bg-koyi-surface text-koyi-muted'
                  }`}
                >
                  <Icon />
                </span>
                <span className="flex-1">
                  <span className="text-koyi-text flex items-center gap-2 text-base font-semibold">
                    {label}
                    {selected && (
                      <span className="bg-koyi-primary inline-flex size-5 items-center justify-center rounded-full text-white">
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          className="size-3 fill-none stroke-current stroke-3"
                        >
                          <path d="m5 13 4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </span>
                  <span className="text-koyi-muted mt-1 block text-sm">{description}</span>
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="bg-koyi-primary hover:bg-koyi-primary-hover mt-8 rounded-md px-4 py-3 text-center text-sm font-medium text-white transition-colors"
        >
          Continue
        </button>
      </main>
    </div>
  );
}

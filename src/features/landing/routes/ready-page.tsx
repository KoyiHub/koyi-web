import { Link, useLocation } from 'react-router';

import { ArrowRightIcon, CheckCircleIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { StepHeader } from '@/features/landing/components/step-header';
import { readJourneyState } from '@/features/landing/lib/journey-state';

/** What the administrator can do the moment they land inside. */
const NEXT_STEPS = [
  'Create your classes for the session',
  'Invite your teachers to join the school',
  'Enrol learners and run their first assessment',
];

/** Step 6 of the public journey, at "/ready". */
export function ReadyPage() {
  const location = useLocation();
  const school = readJourneyState(location.state);

  return (
    <section className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6 lg:py-16">
      <StepHeader
        stepKey="ready"
        title="Your school is ready for smarter learning"
        subtitle={
          school
            ? `${school.name} is set up on Koyi. Head to your dashboard to invite teachers and start assessing learners.`
            : 'Your school is set up on Koyi. Head to your dashboard to invite teachers and start assessing learners.'
        }
      />

      <div className="rounded-koyi-lg border-koyi-border bg-koyi-card mt-10 border p-6 shadow-sm sm:p-8">
        <span className="bg-koyi-success/10 text-koyi-success mx-auto flex size-14 items-center justify-center rounded-full">
          <CheckCircleIcon className="size-7 fill-none stroke-current stroke-2" />
        </span>

        <h2 className="text-koyi-text mt-5 text-center text-base font-semibold">
          What happens next
        </h2>

        <ul className="mx-auto mt-4 flex max-w-sm flex-col gap-3">
          {NEXT_STEPS.map((step) => (
            <li key={step} className="text-koyi-text flex gap-3 text-sm">
              <CheckCircleIcon className="text-koyi-primary mt-0.5 size-4 shrink-0 fill-none stroke-current stroke-2" />
              <span className="text-pretty">{step}</span>
            </li>
          ))}
        </ul>

        <Link
          to={paths.schoolAdmin.dashboard}
          className="bg-koyi-primary hover:bg-koyi-primary-hover rounded-koyi-md mt-8 inline-flex h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold text-white transition-colors"
        >
          Go to Dashboard
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
}

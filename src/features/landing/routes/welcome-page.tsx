import { Link } from 'react-router';

import { ArrowRightIcon, CheckCircleIcon, TrendingUpIcon } from '@/components/ui/icons';
import { illustrations } from '@/config/illustrations';
import { paths } from '@/config/paths';
import { StepProgress } from '@/features/landing/components/step-progress';

/**
 * The FLN gap Koyi exists to close, from the MICS-based UNICEF figures in the
 * project problem statement. Concrete numbers do the persuading here — the
 * design's generic "trusted by educators" line alone does not explain why a
 * head teacher should care.
 */
const EVIDENCE = [
  { figure: '27%', caption: 'of Nigerian children aged 7–14 have foundational reading skills' },
  { figure: '25%', caption: 'have foundational numeracy skills' },
  { figure: '3 in 4', caption: 'lack foundational reading or numeracy skills' },
];

/** Step 1 of the public journey, at "/". */
export function WelcomePage() {
  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <div>
          <StepProgress stepKey="welcome" variant="inline" />

          <h1 className="text-koyi-text mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Welcome to Koyi
          </h1>
          <p className="text-koyi-primary mt-4 text-lg font-semibold tracking-tight sm:text-xl">
            Smarter assessment. Better teaching. Stronger learning.
          </p>
          <p className="text-koyi-muted mt-4 max-w-md text-base leading-relaxed">
            Koyi helps schools assess foundational literacy and numeracy, understand every
            learner&apos;s needs, and track their progress from one place.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to={paths.landing.howItWorks}
              className="bg-koyi-primary hover:bg-koyi-primary-hover rounded-koyi-md inline-flex h-12 items-center justify-center gap-2 px-6 text-sm font-semibold text-white transition-colors"
            >
              Get Started
              <ArrowRightIcon />
            </Link>
            <Link
              to={paths.login.chooser}
              className="border-koyi-border bg-koyi-card text-koyi-primary hover:bg-koyi-surface rounded-koyi-md inline-flex h-12 items-center justify-center border px-6 text-sm font-semibold transition-colors"
            >
              I already have an account
            </Link>
          </div>

          <hr className="border-koyi-border mt-10" />
          <p className="text-koyi-muted mt-4 text-xs font-medium tracking-wide">
            Trusted by educators across Nigeria
          </p>
        </div>

        <div className="relative">
          <img
            src={illustrations.classroom}
            alt="A teacher reviewing a literacy and numeracy progress dashboard with her students"
            className="rounded-koyi-lg border-koyi-border aspect-4/3 w-full border object-cover shadow-sm"
          />

          <div className="rounded-koyi-lg border-koyi-border bg-koyi-card absolute top-6 -left-2 flex items-center gap-3 border p-3 shadow-lg sm:-left-6">
            <span className="bg-koyi-accent/15 text-koyi-accent flex size-9 shrink-0 items-center justify-center rounded-full">
              <TrendingUpIcon />
            </span>
            <span>
              <span className="text-koyi-muted block text-xs">Class Average</span>
              <span className="text-koyi-text block text-sm font-bold">+14% Growth</span>
            </span>
          </div>

          <div className="rounded-koyi-lg border-koyi-border bg-koyi-card absolute -right-2 bottom-6 flex items-center gap-3 border p-3 shadow-lg sm:-right-6">
            <span className="bg-koyi-primary flex size-9 shrink-0 items-center justify-center rounded-full text-white">
              <CheckCircleIcon />
            </span>
            <span>
              <span className="text-koyi-muted block text-xs">Literacy Module</span>
              <span className="text-koyi-text block text-sm font-bold">Completed</span>
            </span>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="evidence-heading"
        className="border-koyi-border bg-koyi-card border-y"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <h2 id="evidence-heading" className="text-koyi-text text-center text-sm font-semibold">
            Nigeria is facing a foundational literacy and numeracy crisis
          </h2>
          <dl className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {EVIDENCE.map((item) => (
              <div key={item.figure} className="text-center">
                <dt className="text-koyi-primary text-3xl font-bold tracking-tight">
                  {item.figure}
                </dt>
                <dd className="text-koyi-muted mx-auto mt-2 max-w-56 text-sm text-pretty">
                  {item.caption}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-koyi-muted mt-6 text-center text-xs">
            Source: MICS-based UNICEF data on Nigerian children aged 7–14.
          </p>
        </div>
      </section>
    </>
  );
}

import type { ComponentType, SVGProps } from 'react';
import { Link } from 'react-router';

import {
  ArrowRightIcon,
  BuildingIcon,
  CheckCircleIcon,
  GraduationCapIcon,
} from '@/components/ui/icons';
import { paths } from '@/config/paths';

interface LoginRole {
  key: string;
  title: string;
  summary: string;
  to: string;
  cta: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  points: string[];
}

/**
 * Which sign-in form to show. Unlike the informational role cards on
 * "/how-it-works", these are real choices — the two roles hold different
 * credentials, so we cannot work out which form to show from a shared field.
 * The card design deliberately matches that page so the two read as one
 * product.
 */
const ROLES: LoginRole[] = [
  {
    key: 'school-admin',
    title: 'School Administrator',
    summary: 'Run the school: teachers, students, classes and whole-school progress.',
    to: paths.login.schoolAdmin,
    cta: 'Continue as School Admin',
    icon: BuildingIcon,
    points: [
      'Sign in with the email address you registered the school with',
      'Add teachers, students and classes',
      'See how every class is performing',
    ],
  },
  {
    key: 'school-teacher',
    title: 'School Teacher',
    summary: 'Assess your learners and teach to what each group actually needs.',
    to: paths.login.teacher,
    cta: 'Continue as School Teacher',
    icon: GraduationCapIcon,
    points: [
      'Sign in with the Teacher ID and School ID your school issued',
      'Run literacy and numeracy assessments',
      'Track each learner’s progress over time',
    ],
  },
];

/** Entry point of the sign-in journey, at "/login". */
export function LoginRolePage() {
  return (
    <section className="w-full max-w-4xl">
      <div className="text-center">
        <h1 className="text-koyi-text text-2xl font-semibold sm:text-3xl">Log in to Koyi</h1>
        <p className="text-koyi-muted mx-auto mt-2 max-w-md text-sm text-pretty">
          Choose how you use Koyi. Your role was set when your school account was created — pick the
          one that matches the details you were given.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {ROLES.map((role) => {
          const Icon = role.icon;
          return (
            <Link
              key={role.key}
              to={role.to}
              className="rounded-koyi-lg border-koyi-border bg-koyi-card hover:border-koyi-primary focus-visible:outline-koyi-primary group flex flex-col border p-6 shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span className="bg-koyi-primary/10 text-koyi-primary rounded-koyi-md flex size-11 items-center justify-center">
                <Icon className="size-5 fill-none stroke-current stroke-2" />
              </span>
              <h2 className="text-koyi-text mt-4 text-lg font-semibold">{role.title}</h2>
              <p className="text-koyi-muted mt-1 text-sm text-pretty">{role.summary}</p>

              <ul className="mt-5 flex flex-col gap-3">
                {role.points.map((point) => (
                  <li key={point} className="text-koyi-text flex gap-3 text-sm">
                    <CheckCircleIcon className="text-koyi-primary mt-0.5 size-4 shrink-0 fill-none stroke-current stroke-2" />
                    <span className="text-pretty">{point}</span>
                  </li>
                ))}
              </ul>

              <span className="text-koyi-primary mt-6 flex items-center gap-2 text-sm font-semibold">
                {role.cta}
                <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>

      <p className="text-koyi-muted mt-8 text-center text-sm">
        Don&apos;t have a school on Koyi yet?{' '}
        <Link
          to={paths.landing.getStarted}
          className="text-koyi-primary font-medium hover:underline"
        >
          Set your school up
        </Link>
      </p>
    </section>
  );
}

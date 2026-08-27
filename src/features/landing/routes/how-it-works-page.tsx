import type { ComponentType, SVGProps } from 'react';

import { BuildingIcon, CheckCircleIcon, GraduationCapIcon, UsersIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { StepActions } from '@/features/landing/components/step-actions';
import { StepHeader } from '@/features/landing/components/step-header';

interface KoyiRole {
  key: string;
  title: string;
  summary: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tasks: string[];
}

/**
 * The two people who use Koyi inside a school. This is deliberately
 * informational — the design showed selectable role cards, but a visitor has
 * no account yet, so there is nothing meaningful to choose. A school is
 * created once (step 4) and teachers are added from inside it.
 */
const ROLES: KoyiRole[] = [
  {
    key: 'school-admin',
    title: 'School Administrator',
    summary: 'Sets the school up and sees how every class is doing.',
    icon: BuildingIcon,
    tasks: [
      'Register the school and its current academic session',
      'Create classes and invite teachers',
      'Enrol students and assign them to classes',
      'Track literacy and numeracy progress across the whole school',
    ],
  },
  {
    key: 'school-teacher',
    title: 'School Teacher',
    summary: 'Assesses learners and teaches to what each group actually needs.',
    icon: GraduationCapIcon,
    tasks: [
      'Run foundational literacy and numeracy assessments',
      'See each learner’s level instead of a single cut-off mark',
      'Group learners by learning need, not by age',
      'Follow what to teach next and watch progress change',
    ],
  },
];

/** Step 2 of the public journey, at "/how-it-works". */
export function HowItWorksPage() {
  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 lg:py-16">
      <StepHeader
        stepKey="how-it-works"
        title="How will you use Koyi?"
        subtitle="Koyi is built around two roles inside a school. Here is what each one does — you will not need to choose now, your role is set when your school is created."
      />

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {ROLES.map((role) => {
          const Icon = role.icon;
          return (
            <article
              key={role.key}
              className="rounded-koyi-lg border-koyi-border bg-koyi-card flex flex-col border p-6 shadow-sm"
            >
              <span className="bg-koyi-primary/10 text-koyi-primary rounded-koyi-md flex size-11 items-center justify-center">
                <Icon className="size-5 fill-none stroke-current stroke-2" />
              </span>
              <h2 className="text-koyi-text mt-4 text-lg font-semibold">{role.title}</h2>
              <p className="text-koyi-muted mt-1 text-sm">{role.summary}</p>

              <ul className="mt-5 flex flex-col gap-3">
                {role.tasks.map((task) => (
                  <li key={task} className="text-koyi-text flex gap-3 text-sm">
                    <CheckCircleIcon className="text-koyi-primary mt-0.5 size-4 shrink-0 fill-none stroke-current stroke-2" />
                    <span className="text-pretty">{task}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <p className="text-koyi-muted rounded-koyi-md border-koyi-border bg-koyi-card mt-6 flex items-start gap-3 border p-4 text-sm">
        <UsersIcon className="text-koyi-accent mt-0.5 size-4 shrink-0 fill-none stroke-current stroke-2" />
        <span className="text-pretty">
          The person setting the school up becomes its first administrator. Teachers are invited
          afterwards from the school dashboard, so no one has to pick a role here.
        </span>
      </p>

      <StepActions stepKey="how-it-works" nextTo={paths.landing.features} className="mt-10" />
    </section>
  );
}

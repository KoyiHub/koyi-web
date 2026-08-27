import type { ComponentType, SVGProps } from 'react';

import {
  ClipboardIcon,
  LayersIcon,
  SparklesIcon,
  TrendingUpIcon,
  UsersIcon,
} from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { StepActions } from '@/features/landing/components/step-actions';
import { StepHeader } from '@/features/landing/components/step-header';

interface Feature {
  title: string;
  body: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/**
 * The capability set described in the Koyi problem statement: assess, place,
 * group, guide, track. Each card names a real product surface rather than a
 * generic benefit, so the claims stay checkable against what is built.
 */
const FEATURES: Feature[] = [
  {
    title: 'Foundational assessment',
    body: 'Run short literacy and numeracy assessments that show what a child can actually do — letter sounds, reading, number recognition, operations — instead of one pass-or-fail score.',
    icon: ClipboardIcon,
  },
  {
    title: 'Automatic level placement',
    body: 'Koyi places each learner at the level their answers show, so a child who has moved up a class without the skills is no longer invisible.',
    icon: LayersIcon,
  },
  {
    title: 'Grouping by learning need',
    body: 'Learners are grouped by what they need next rather than by age or class, which is what makes teaching to the right level possible in a crowded classroom.',
    icon: UsersIcon,
  },
  {
    title: 'Guidance on what to teach next',
    body: 'Every group comes with a suggested focus, so the assessment result turns into a lesson plan instead of another report nobody acts on.',
    icon: SparklesIcon,
  },
  {
    title: 'Progress you can see over time',
    body: 'Re-assess through the term and watch each learner and each group move, at class level and across the whole school.',
    icon: TrendingUpIcon,
  },
];

/** Step 3 of the public journey, at "/features". */
export function FeaturesPage() {
  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 lg:py-16">
      <StepHeader
        stepKey="features"
        title="Everything you need to understand your learners"
        subtitle="Koyi turns a foundational literacy and numeracy assessment into something a teacher can act on the same week."
      />

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <article
              key={feature.title}
              className="rounded-koyi-lg border-koyi-border bg-koyi-card border p-6 shadow-sm"
            >
              <span className="bg-koyi-primary/10 text-koyi-primary rounded-koyi-md flex size-11 items-center justify-center">
                <Icon className="size-5 fill-none stroke-current stroke-2" />
              </span>
              <h2 className="text-koyi-text mt-4 text-base font-semibold">{feature.title}</h2>
              <p className="text-koyi-muted mt-2 text-sm leading-relaxed text-pretty">
                {feature.body}
              </p>
            </article>
          );
        })}
      </div>

      <StepActions stepKey="features" nextTo={paths.landing.getStarted} className="mt-10" />
    </section>
  );
}

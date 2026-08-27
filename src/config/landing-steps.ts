import { paths } from '@/config/paths';

export interface LandingStep {
  /** Stable identifier, used as the React key and in tests. */
  key: string;
  /** Short name shown beside the progress bar on the centred steps. */
  label: string;
  path: string;
}

/**
 * The public entry journey, in order. The progress indicator, the step
 * counter ("Step 3 of 6") and every Back/Continue button derive their target
 * from this list — so re-ordering or inserting a step is a single edit here,
 * not a sweep through six page components.
 */
export const landingSteps: LandingStep[] = [
  { key: 'welcome', label: 'Welcome', path: paths.landing.welcome },
  { key: 'how-it-works', label: 'How It Works', path: paths.landing.howItWorks },
  { key: 'features', label: 'Features', path: paths.landing.features },
  { key: 'get-started', label: 'Set Up', path: paths.landing.getStarted },
  { key: 'verify-email', label: 'Verify Email', path: paths.landing.verifyEmail },
  { key: 'ready', label: 'Ready', path: paths.landing.ready },
];

export const landingStepCount = landingSteps.length;

/** 1-based position of a step, for the "Step N of 6" counter. */
export function stepNumber(key: string): number {
  return landingSteps.findIndex((step) => step.key === key) + 1;
}

/** Previous step's path, or `undefined` on the first step. */
export function previousStepPath(key: string): string | undefined {
  const index = landingSteps.findIndex((step) => step.key === key);
  return index > 0 ? landingSteps[index - 1]?.path : undefined;
}

/** Next step's path, or `undefined` on the last step. */
export function nextStepPath(key: string): string | undefined {
  const index = landingSteps.findIndex((step) => step.key === key);
  return index >= 0 && index < landingSteps.length - 1 ? landingSteps[index + 1]?.path : undefined;
}

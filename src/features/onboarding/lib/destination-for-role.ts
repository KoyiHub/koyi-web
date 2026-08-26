import { paths } from '@/config/paths';
import type { OnboardingRole } from '@/features/onboarding/hooks/use-onboarding-role';

/**
 * Role-aware onboarding exit point. School Teacher goes to the existing
 * signup flow; School Admin goes to a placeholder — the real school-setup
 * screen (Fresh PDF page 4) isn't built yet.
 */
export function destinationForRole(role: OnboardingRole): string {
  return role === 'admin' ? paths.onboarding.schoolSetup : paths.auth.signup;
}

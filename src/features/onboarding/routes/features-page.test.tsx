import { beforeEach, describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { renderRoute, screen, waitFor } from '@/test/test-utils';

describe('FeaturesPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('redirects to Role Selection when accessed directly with no valid selected role', async () => {
    const { router } = renderRoute(paths.onboarding.features, { authenticated: false });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(paths.onboarding.role);
    });
  });

  it('redirects to Role Selection when sessionStorage holds an invalid role value', async () => {
    sessionStorage.setItem('koyi_onboarding_role', 'principal');
    const { router } = renderRoute(paths.onboarding.features, { authenticated: false });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(paths.onboarding.role);
    });
  });

  it('Back returns to Role Selection', async () => {
    sessionStorage.setItem('koyi_onboarding_role', 'teacher');
    const { user, router } = renderRoute(paths.onboarding.features, { authenticated: false });

    await user.click(await screen.findByRole('button', { name: 'Back' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(paths.onboarding.role);
    });
  });

  it('Continue routes the selected School Teacher role to signup', async () => {
    sessionStorage.setItem('koyi_onboarding_role', 'teacher');
    const { user, router } = renderRoute(paths.onboarding.features, { authenticated: false });

    await user.click(await screen.findByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(paths.auth.signup);
    });
  });

  it('Skip routes the selected School Teacher role to signup', async () => {
    sessionStorage.setItem('koyi_onboarding_role', 'teacher');
    const { user, router } = renderRoute(paths.onboarding.features, { authenticated: false });

    await user.click(await screen.findByRole('button', { name: 'Skip' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(paths.auth.signup);
    });
  });

  it('routes School Admin to school setup on Continue', async () => {
    sessionStorage.setItem('koyi_onboarding_role', 'admin');
    const { user, router } = renderRoute(paths.onboarding.features, { authenticated: false });

    await user.click(await screen.findByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(paths.onboarding.schoolSetup);
    });
  });
});

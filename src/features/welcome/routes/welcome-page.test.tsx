import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { renderRoute, screen, waitFor } from '@/test/test-utils';

describe('WelcomePage calls to action', () => {
  it('points "Get Started" at role selection and navigates there', async () => {
    const { user, router } = renderRoute(paths.welcome, { authenticated: false });

    const getStarted = await screen.findByRole('link', { name: 'Get Started' });
    expect(getStarted).toHaveAttribute('href', paths.onboarding.role);

    await user.click(getStarted);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(paths.onboarding.role);
    });
  });

  it('points "I already have an account" at the login route and navigates there', async () => {
    const { user, router } = renderRoute(paths.welcome, { authenticated: false });

    const signIn = await screen.findByRole('link', { name: 'I already have an account' });
    expect(signIn).toHaveAttribute('href', paths.auth.login);

    await user.click(signIn);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(paths.auth.login);
    });
  });
});

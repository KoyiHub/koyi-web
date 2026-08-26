import { beforeEach, describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { renderRoute, screen, waitFor } from '@/test/test-utils';

describe('RoleSelectionPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('defaults to School Teacher selected', async () => {
    renderRoute(paths.onboarding.role, { authenticated: false });

    const teacher = await screen.findByRole('radio', { name: /School Teacher/ });
    const admin = screen.getByRole('radio', { name: /School Admin/ });

    expect(teacher).toHaveAttribute('aria-checked', 'true');
    expect(admin).toHaveAttribute('aria-checked', 'false');
  });

  it('switches selection when a different role is clicked', async () => {
    const { user } = renderRoute(paths.onboarding.role, { authenticated: false });

    const admin = await screen.findByRole('radio', { name: /School Admin/ });
    await user.click(admin);

    expect(admin).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /School Teacher/ })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('Continue navigates to the Features page', async () => {
    const { user, router } = renderRoute(paths.onboarding.role, { authenticated: false });

    await user.click(await screen.findByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(paths.onboarding.features);
    });
  });

  it('Skip routes School Admin straight to school setup, School Teacher straight to signup', async () => {
    const { user, router } = renderRoute(paths.onboarding.role, { authenticated: false });

    await user.click(await screen.findByRole('radio', { name: /School Admin/ }));
    await user.click(screen.getByRole('button', { name: 'Skip' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(paths.onboarding.schoolSetup);
    });
  });

  it('persists the selected role across navigation to the Features page', async () => {
    const { user, router } = renderRoute(paths.onboarding.role, { authenticated: false });

    await user.click(await screen.findByRole('radio', { name: /School Admin/ }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(paths.onboarding.features);
    });

    await user.click(await screen.findByRole('button', { name: 'Skip' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(paths.onboarding.schoolSetup);
    });
  });
});

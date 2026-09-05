import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { renderRoute, screen, waitFor } from '@/test/test-utils';

/**
 * Teacher password reset request — `frontend-integration.md` §5.1.
 * Code-based, like the school admin flow: the request always confirms,
 * whether or not the id is registered, then hands off to the reset page.
 */
describe('TeacherForgotPasswordPage', () => {
  it('always confirms the request and moves to the code + password step', async () => {
    const { user, router } = renderRoute(paths.login.teacherForgotPassword, {
      authenticated: false,
    });
    await screen.findByRole('heading', { name: 'Forgot your password?' });

    await user.type(screen.getByLabelText('Teacher ID'), 'GHS-T-99999');
    await user.click(screen.getByRole('button', { name: 'Send reset code' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(paths.login.teacherResetPassword);
    });
    expect(
      await screen.findByRole('heading', { name: 'Choose a new password' }),
    ).toBeInTheDocument();
  });
});

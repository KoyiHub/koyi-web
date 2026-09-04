import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { renderRoute, screen, waitFor } from '@/test/test-utils';

const VALID_TOKEN = 'mock-teacher-reset-token';

/**
 * Where a teacher's emailed reset link lands — `frontend-integration.md`
 * §5.1. The token travels in the URL; there is no code-entry step.
 */
describe('TeacherResetPasswordPage', () => {
  it("rejects a missing token rather than showing a form that can't work", async () => {
    renderRoute(paths.login.teacherResetPassword, { authenticated: false });

    expect(await screen.findByText("This link isn't valid")).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Request a new link' })).toHaveAttribute(
      'href',
      paths.login.teacherForgotPassword,
    );
  });

  it('resets the password with a valid token and returns to sign in', async () => {
    const { user, router } = renderRoute(
      `${paths.login.teacherResetPassword}?token=${VALID_TOKEN}`,
      {
        authenticated: false,
      },
    );
    await screen.findByRole('heading', { name: 'Choose a new password' });

    await user.type(screen.getByLabelText('New password'), 'a-new-password1');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(paths.login.teacher);
    });
    expect(await screen.findByText(/Password reset/)).toBeInTheDocument();
  });

  it('shows an error for an expired or unknown token', async () => {
    const { user } = renderRoute(`${paths.login.teacherResetPassword}?token=not-a-real-token`, {
      authenticated: false,
    });
    await screen.findByRole('heading', { name: 'Choose a new password' });

    await user.type(screen.getByLabelText('New password'), 'a-new-password1');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(
      await screen.findByText('That reset link has expired. Request a new one.'),
    ).toBeInTheDocument();
  });
});

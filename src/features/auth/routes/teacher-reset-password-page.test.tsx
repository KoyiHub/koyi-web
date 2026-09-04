import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { renderRoute, screen, waitFor } from '@/test/test-utils';

/**
 * Where the teacher password reset flow lands — `frontend-integration.md`
 * §5.1. Code-based: code and new password are entered together and spent
 * in one `confirm` call, no separate verify step and no `reset_token`.
 */
describe('TeacherResetPasswordPage', () => {
  it("rejects a missing teacher id rather than showing a form that can't work", async () => {
    renderRoute(paths.login.teacherResetPassword, { authenticated: false });

    expect(await screen.findByRole('heading', { name: 'Request a new code' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Request a new code' })).toHaveAttribute(
      'href',
      paths.login.teacherForgotPassword,
    );
  });

  it('resets the password with a valid code and returns to sign in', async () => {
    const { user, router } = renderRoute(paths.login.teacherForgotPassword, {
      authenticated: false,
    });
    await screen.findByRole('heading', { name: 'Forgot your password?' });

    await user.type(screen.getByLabelText('Teacher ID'), 'GHS-T-00007');
    await user.click(screen.getByRole('button', { name: 'Send reset code' }));
    await screen.findByRole('heading', { name: 'Choose a new password' });

    const boxes = screen.getAllByRole('textbox');
    await user.type(boxes[0]!, '123456');
    await user.type(screen.getByLabelText('New password'), 'a-new-password1');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(paths.login.teacher);
    });
    expect(await screen.findByText(/Password reset/)).toBeInTheDocument();
  });

  it('shows an error for an incorrect code', async () => {
    const { user } = renderRoute(paths.login.teacherForgotPassword, { authenticated: false });
    await screen.findByRole('heading', { name: 'Forgot your password?' });

    await user.type(screen.getByLabelText('Teacher ID'), 'GHS-T-00007');
    await user.click(screen.getByRole('button', { name: 'Send reset code' }));
    await screen.findByRole('heading', { name: 'Choose a new password' });

    const boxes = screen.getAllByRole('textbox');
    await user.type(boxes[0]!, '000000');
    await user.type(screen.getByLabelText('New password'), 'a-new-password1');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(await screen.findByText('That code is incorrect or has expired.')).toBeInTheDocument();
  });
});

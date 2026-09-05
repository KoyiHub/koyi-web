import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { renderRoute, screen } from '@/test/test-utils';

/**
 * School admin password reset — `frontend-integration.md` §4.1. Three
 * steps in one page: email → code → new password.
 */
describe('SchoolAdminForgotPasswordPage', () => {
  it('walks from email to a new password on the right code', async () => {
    const { user } = renderRoute(paths.login.schoolAdminForgotPassword, {
      authenticated: false,
    });
    await screen.findByRole('heading', { name: 'Forgot your password?' });

    await user.type(screen.getByLabelText('Email address'), 'admin@school.edu');
    await user.click(screen.getByRole('button', { name: 'Send reset code' }));

    await screen.findByRole('heading', { name: 'Check your email' });
    const boxes = screen.getAllByRole('textbox');
    await user.type(boxes[0]!, '123456');

    await screen.findByRole('heading', { name: 'Choose a new password' });
    await user.type(screen.getByLabelText('New password'), 'a-new-password1');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(await screen.findByRole('heading', { name: 'Password reset' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      paths.login.schoolAdmin,
    );
  });

  it('rejects a wrong code and stays on the code step', async () => {
    const { user } = renderRoute(paths.login.schoolAdminForgotPassword, {
      authenticated: false,
    });
    await screen.findByRole('heading', { name: 'Forgot your password?' });

    await user.type(screen.getByLabelText('Email address'), 'admin@school.edu');
    await user.click(screen.getByRole('button', { name: 'Send reset code' }));
    await screen.findByRole('heading', { name: 'Check your email' });

    const boxes = screen.getAllByRole('textbox');
    await user.type(boxes[0]!, '000000');

    expect(await screen.findByText('That code is incorrect or has expired.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Check your email' })).toBeInTheDocument();
  });
});

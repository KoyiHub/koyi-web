import { describe, expect, it } from 'vitest';

import { paths } from '@/config/paths';
import { renderRoute, screen } from '@/test/test-utils';

/**
 * Teacher password reset request — `frontend-integration.md` §5.1.
 * Link-based: this page's job ends the moment the request succeeds, there
 * is no code to enter.
 */
describe('TeacherForgotPasswordPage', () => {
  it('always confirms the request, whether or not the id is registered', async () => {
    const { user } = renderRoute(paths.login.teacherForgotPassword, { authenticated: false });
    await screen.findByRole('heading', { name: 'Forgot your password?' });

    await user.type(screen.getByLabelText('Teacher ID'), 'GHS-T-99999');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(await screen.findByRole('heading', { name: 'Check your email' })).toBeInTheDocument();
    expect(
      screen.getByText(/If that Teacher ID is registered, we've emailed a link/),
    ).toBeInTheDocument();
  });
});

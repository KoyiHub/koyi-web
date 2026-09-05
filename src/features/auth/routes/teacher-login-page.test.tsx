import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { getAuthToken } from '@/lib/auth/token-store';
import { server } from '@/mocks/server';
import { renderRoute, screen } from '@/test/test-utils';

const LOGIN_URL = '*/api/v1/teacher/auth/login/';

async function fillAndSubmit(
  user: ReturnType<typeof renderRoute>['user'],
  values: { teacherId: string; password: string },
) {
  await user.type(screen.getByLabelText('Teacher ID'), values.teacherId);
  await user.type(screen.getByLabelText('Password'), values.password);
  await user.click(screen.getByRole('button', { name: 'Log In' }));
}

describe('TeacherLoginPage', () => {
  it('asks for a teacher id and a password, and nothing else', async () => {
    renderRoute('/login/teacher', { authenticated: false });

    expect(await screen.findByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
    expect(screen.getByLabelText('Teacher ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    // The teacher id already carries the school's abbreviation as a prefix.
    expect(screen.queryByLabelText('School ID')).not.toBeInTheDocument();
  });

  it('offers no way to self-register — a school admin creates the account', async () => {
    renderRoute('/login/teacher', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome Back' });

    expect(screen.queryByRole('link', { name: /sign up/i })).not.toBeInTheDocument();
  });

  it('validates both required fields', async () => {
    const { user } = renderRoute('/login/teacher', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome Back' });

    await user.click(screen.getByRole('button', { name: 'Log In' }));

    expect(await screen.findByText('Teacher ID is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(getAuthToken()).toBeNull();
  });

  it('stores tokens and lands on the dashboard', async () => {
    const { user } = renderRoute('/login/teacher', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome Back' });

    await fillAndSubmit(user, { teacherId: 'GHS-T-00007', password: 'password123' });

    expect(await screen.findByText('Total students')).toBeInTheDocument();
    expect(getAuthToken()).toBe('mock-access-token');
  });

  it('accepts a teacher id in any case', async () => {
    const { user } = renderRoute('/login/teacher', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome Back' });

    await fillAndSubmit(user, { teacherId: 'ghs-t-00007', password: 'password123' });

    expect(await screen.findByText('Total students')).toBeInTheDocument();
    expect(getAuthToken()).toBe('mock-access-token');
  });

  it('shows the backend message verbatim and creates no session when sign-in fails', async () => {
    // The same message covers a wrong password, an unknown id and a disabled
    // account. That sameness is the security property — this test exists to
    // stop a well-meaning "check your Teacher ID" hint being added later.
    server.use(
      http.post(LOGIN_URL, () =>
        HttpResponse.json(
          {
            error: {
              type: 'authentication_failed',
              message: 'No active account found with the given credentials',
              detail: null,
              request_id: 'test-request-id',
            },
          },
          { status: 401 },
        ),
      ),
    );

    const { user } = renderRoute('/login/teacher', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome Back' });

    await fillAndSubmit(user, { teacherId: 'GHS-T-00007', password: 'wrong-password' });

    expect(
      await screen.findByText('No active account found with the given credentials'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/check your teacher id/i)).not.toBeInTheDocument();
    expect(getAuthToken()).toBeNull();
  });
});

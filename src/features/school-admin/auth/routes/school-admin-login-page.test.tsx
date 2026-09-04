import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { getAuthToken } from '@/lib/auth/token-store';
import { server } from '@/mocks/server';
import { renderRoute, screen, waitFor } from '@/test/test-utils';

const LOGIN_URL = '*/api/v1/school/auth/login/';

async function signIn(user: ReturnType<typeof renderRoute>['user'], password = 'password123') {
  await user.type(screen.getByLabelText('Email Address'), 'admin@school.edu');
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Log In' }));
}

describe('SchoolAdminLoginPage', () => {
  it('validates the required fields', async () => {
    const { user } = renderRoute('/login/school-admin', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome Back' });

    await user.click(screen.getByRole('button', { name: 'Log In' }));

    expect(await screen.findByText('Email address is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('signs in straight to the dashboard on a recognised device', async () => {
    const { user, router } = renderRoute('/login/school-admin', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome Back' });

    await signIn(user);

    // Assert the redirect, not the dashboard's contents: that route is a heavy
    // lazy chunk, and rendering it here would only re-test `dashboard-page`.
    await waitFor(
      () => {
        expect(router.state.location.pathname).toBe('/school-admin/dashboard');
      },
      // The dashboard chunk loads before the redirect commits, which is slower
      // than waitFor's 1s default when the suite runs files in parallel.
      { timeout: 10_000 },
    );
    expect(getAuthToken()).toBe('mock-access-token');
  });

  it('hands off to the device check, without a session, when the backend asks for one', async () => {
    server.use(
      http.post(LOGIN_URL, () =>
        HttpResponse.json({
          verification_required: true,
          challenge_id: 'mock-device-challenge',
          email: 'admin@school.edu',
        }),
      ),
    );

    const { user, router } = renderRoute('/login/school-admin', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome Back' });

    await signIn(user);

    expect(await screen.findByRole('heading', { name: 'Check this device' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login/verify-device');
    // The challenge branch carries no tokens — nothing may be stored yet.
    expect(getAuthToken()).toBeNull();
  });

  it('shows the backend error when the credentials are rejected', async () => {
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

    const { user } = renderRoute('/login/school-admin', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome Back' });

    await signIn(user, 'wrong-password');

    expect(
      await screen.findByText('No active account found with the given credentials'),
    ).toBeInTheDocument();
    expect(getAuthToken()).toBeNull();
  });
});

describe('SchoolAdminVerifyDevicePage', () => {
  it('sends an admin arriving without a challenge back to the login form', async () => {
    const { router } = renderRoute('/login/verify-device', { authenticated: false });

    expect(await screen.findByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login/school-admin');
  });

  it('issues a session only after the code clears', async () => {
    server.use(
      http.post(LOGIN_URL, () =>
        HttpResponse.json({
          verification_required: true,
          challenge_id: 'mock-device-challenge',
          email: 'admin@school.edu',
        }),
      ),
    );

    const { user, router } = renderRoute('/login/school-admin', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome Back' });
    await signIn(user);
    await screen.findByRole('heading', { name: 'Check this device' });

    const boxes = screen.getAllByRole('textbox');
    await user.type(boxes[0]!, '123456');

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/school-admin/dashboard');
    });
    expect(getAuthToken()).toBe('mock-access-token');
  });
});

import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { getAuthToken, getRefreshToken } from '@/lib/auth/token-store';
import { server } from '@/mocks/server';
import { renderRoute, screen } from '@/test/test-utils';

describe('LoginPage', () => {
  it('renders the welcome back heading', async () => {
    renderRoute('/login', { authenticated: false });

    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const { user } = renderRoute('/login', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome back' });

    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('rejects an invalid email', async () => {
    const { user } = renderRoute('/login', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome back' });

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
  });

  it('stores tokens and navigates to the dashboard on a successful login', async () => {
    const { user } = renderRoute('/login', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome back' });

    await user.type(screen.getByLabelText('Email'), 'teacher@koyi.ng');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(getAuthToken()).toBe('mock-access-token');
    expect(getRefreshToken()).toBe('mock-refresh-token');
  });

  it('shows the backend error on invalid credentials and does not navigate', async () => {
    const { user } = renderRoute('/login', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome back' });

    await user.type(screen.getByLabelText('Email'), 'teacher@koyi.ng');
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(
      await screen.findByText('No active account found with the given credentials'),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(getAuthToken()).toBeNull();
  });

  it('disables the submit button while the request is in flight', async () => {
    server.use(
      http.post(
        '*/api/v1/auth/login/',
        async () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(
                HttpResponse.json({
                  access: 'a',
                  refresh: 'r',
                  user: {
                    id: '11111111-1111-4111-8111-111111111111',
                    email: 'teacher@koyi.ng',
                    first_name: 'A',
                    last_name: 'B',
                    full_name: 'A B',
                    email_verified: true,
                    created_at: '2026-01-01T00:00:00Z',
                  },
                }),
              );
            }, 50);
          }),
      ),
    );

    const { user } = renderRoute('/login', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome back' });

    await user.type(screen.getByLabelText('Email'), 'teacher@koyi.ng');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(screen.getByRole('button', { name: 'Log in' })).toBeDisabled();
    await screen.findByRole('heading', { name: 'Dashboard' });
  });

  it('links to the signup page', async () => {
    renderRoute('/login', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome back' });

    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup');
  });
});

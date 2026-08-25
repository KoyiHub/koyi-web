import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { getAuthToken } from '@/lib/auth/token-store';
import { server } from '@/mocks/server';
import { renderRoute, screen } from '@/test/test-utils';

describe('SignupPage', () => {
  it('renders the create account heading', async () => {
    renderRoute('/signup', { authenticated: false });

    expect(await screen.findByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const { user } = renderRoute('/signup', { authenticated: false });
    await screen.findByRole('heading', { name: 'Create your account' });

    await user.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(await screen.findByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Email address is required')).toBeInTheDocument();
  });

  it('rejects mismatched passwords', async () => {
    const { user } = renderRoute('/signup', { authenticated: false });
    await screen.findByRole('heading', { name: 'Create your account' });

    await user.type(screen.getByLabelText('Full Name'), 'Amina Yusuf');
    await user.type(screen.getByLabelText('Email Address'), 'amina@koyi.ng');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'password456');
    await user.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
  });

  it('navigates to /login on a successful registration, without creating fake auth state', async () => {
    const { user } = renderRoute('/signup', { authenticated: false });
    await screen.findByRole('heading', { name: 'Create your account' });

    await user.type(screen.getByLabelText('Full Name'), 'Amina Yusuf');
    await user.type(screen.getByLabelText('Email Address'), 'amina@koyi.ng');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.getByText('Account created. You can now log in.')).toBeInTheDocument();
    expect(getAuthToken()).toBeNull();
  });

  it('shows the backend error when registration fails', async () => {
    server.use(
      http.post('*/api/v1/auth/register/', () =>
        HttpResponse.json(
          {
            error: {
              type: 'validation_error',
              message: 'Request could not be processed.',
              detail: { email: ['A user with this email already exists.'] },
              request_id: 'test-request-id',
            },
          },
          { status: 400 },
        ),
      ),
    );

    const { user } = renderRoute('/signup', { authenticated: false });
    await screen.findByRole('heading', { name: 'Create your account' });

    await user.type(screen.getByLabelText('Full Name'), 'Amina Yusuf');
    await user.type(screen.getByLabelText('Email Address'), 'amina@koyi.ng');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(await screen.findByText('Request could not be processed.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
  });
});

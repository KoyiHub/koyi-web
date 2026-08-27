import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { forgetSchoolId, getRememberedSchoolId } from '@/features/auth/lib/school-id-store';
import { getAuthToken } from '@/lib/auth/token-store';
import { server } from '@/mocks/server';
import { renderRoute, screen } from '@/test/test-utils';

const LOGIN_URL = '*/api/v1/auth/teacher/login/';

/** The School ID store outlives a token clear, so each test starts it empty. */
beforeEach(() => {
  forgetSchoolId();
});

async function fillAndSubmit(
  user: ReturnType<typeof renderRoute>['user'],
  values: { teacherId: string; schoolId: string; password: string },
) {
  await user.type(screen.getByLabelText('Teacher ID'), values.teacherId);
  await user.type(screen.getByLabelText('School ID'), values.schoolId);
  await user.type(screen.getByLabelText('Password'), values.password);
  await user.click(screen.getByRole('button', { name: 'Log In' }));
}

describe('TeacherLoginPage', () => {
  it('renders the teacher credential fields', async () => {
    renderRoute('/login/teacher', { authenticated: false });

    expect(await screen.findByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
    expect(screen.getByLabelText('Teacher ID')).toBeInTheDocument();
    expect(screen.getByLabelText('School ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('validates every required field', async () => {
    const { user } = renderRoute('/login/teacher', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome Back' });

    await user.click(screen.getByRole('button', { name: 'Log In' }));

    expect(await screen.findByText('Teacher ID is required')).toBeInTheDocument();
    expect(screen.getByText('School ID is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(getAuthToken()).toBeNull();
  });

  it('prefills the School ID remembered from a previous sign-in', async () => {
    window.localStorage.setItem('koyi.auth.schoolId', 'KOY-SCH-0042');

    renderRoute('/login/teacher', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome Back' });

    expect(screen.getByLabelText('School ID')).toHaveValue('KOY-SCH-0042');
  });

  it('stores tokens, remembers the School ID and lands on the dashboard', async () => {
    const { user } = renderRoute('/login/teacher', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome Back' });

    await fillAndSubmit(user, {
      teacherId: 'TCH-2016-031',
      schoolId: 'koy-sch-0042',
      password: 'password123',
    });

    expect(await screen.findByText('Total Students')).toBeInTheDocument();
    expect(getAuthToken()).toBe('mock-access-token');
    // The value the backend echoed back, not the lowercase one that was typed.
    expect(getRememberedSchoolId()).toBe('KOY-SCH-0042');
  });

  it('does not remember the School ID when the box is unticked', async () => {
    const { user } = renderRoute('/login/teacher', { authenticated: false });
    await screen.findByRole('heading', { name: 'Welcome Back' });

    await user.click(screen.getByLabelText('Remember my School ID on this device'));
    await fillAndSubmit(user, {
      teacherId: 'TCH-2016-031',
      schoolId: 'KOY-SCH-0042',
      password: 'password123',
    });

    expect(await screen.findByText('Total Students')).toBeInTheDocument();
    expect(getRememberedSchoolId()).toBeNull();
  });

  it('shows the backend error and creates no session when the credentials are wrong', async () => {
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

    await fillAndSubmit(user, {
      teacherId: 'TCH-2016-031',
      schoolId: 'KOY-SCH-0042',
      password: 'wrong-password',
    });

    expect(
      await screen.findByText('No active account found with the given credentials'),
    ).toBeInTheDocument();
    expect(getAuthToken()).toBeNull();
    expect(getRememberedSchoolId()).toBeNull();
  });
});

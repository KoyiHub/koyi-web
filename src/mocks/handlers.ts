import { http, HttpResponse } from 'msw';

import type { AuthUser } from '@/features/auth/api/auth.schema';
import type { User } from '@/features/users/api/user.schema';

export const mockUsers: User[] = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', username: 'ada' },
  { id: 2, name: 'Grace Hopper', email: 'grace@example.com', username: 'grace' },
];

export const mockAuthUser: AuthUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'teacher@koyi.ng',
  first_name: 'Amina',
  last_name: 'Yusuf',
  full_name: 'Amina Yusuf',
  email_verified: true,
  created_at: '2026-01-01T00:00:00Z',
};

/** Mirrors the real envelope from `apps.common.exceptions.api_exception_handler`. */
function errorEnvelope(type: string, message: string, detail?: unknown) {
  return { error: { type, message, detail: detail ?? null, request_id: 'test-request-id' } };
}

/**
 * Default happy-path handlers. Individual tests override one endpoint with
 * `server.use(...)` rather than editing this shared list.
 */
export const handlers = [
  http.get('*/api/users', () => HttpResponse.json(mockUsers)),

  http.get('*/api/users/:userId', ({ params }) => {
    const user = mockUsers.find((candidate) => String(candidate.id) === params.userId);
    if (!user) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(user);
  }),

  http.post('*/api/users', async ({ request }) => {
    const body = (await request.json()) as Omit<User, 'id'>;
    return HttpResponse.json({ ...body, id: 999 }, { status: 201 });
  }),

  http.post('*/api/v1/auth/register/', async ({ request }) => {
    const body = (await request.json()) as { email: string; first_name: string; last_name: string };
    return HttpResponse.json(
      {
        ...mockAuthUser,
        email: body.email,
        first_name: body.first_name,
        last_name: body.last_name,
        full_name: `${body.first_name} ${body.last_name}`.trim(),
        email_verified: false,
      },
      { status: 201 },
    );
  }),

  http.post('*/api/v1/auth/login/', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.password !== 'password123') {
      return HttpResponse.json(
        errorEnvelope(
          'authentication_failed',
          'No active account found with the given credentials',
        ),
        { status: 401 },
      );
    }
    return HttpResponse.json({
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
      user: { ...mockAuthUser, email: body.email },
    });
  }),

  http.post('*/api/v1/auth/logout/', () => new HttpResponse(null, { status: 205 })),

  http.post('*/api/v1/auth/token/refresh/', () =>
    HttpResponse.json({ access: 'mock-access-token-2', refresh: 'mock-refresh-token-2' }),
  ),

  http.get('*/api/v1/auth/me/', ({ request }) => {
    const auth = request.headers.get('authorization');
    if (!auth) {
      return HttpResponse.json(
        errorEnvelope('not_authenticated', 'Authentication credentials were not provided.'),
        {
          status: 401,
        },
      );
    }
    return HttpResponse.json(mockAuthUser);
  }),
];

import { http, HttpResponse } from 'msw';

import type { User } from '@/features/users/api/user.schema';

export const mockUsers: User[] = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', username: 'ada' },
  { id: 2, name: 'Grace Hopper', email: 'grace@example.com', username: 'grace' },
];

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
];

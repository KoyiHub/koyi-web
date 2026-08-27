import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/mocks/server';
import { renderRoute, screen, waitFor } from '@/test/test-utils';

describe('UsersPage', () => {
  it('renders the users returned by the API', async () => {
    renderRoute('/teacher/users');

    expect(await screen.findByRole('heading', { name: 'Users' })).toBeInTheDocument();
    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
  });

  it('navigates to a user detail page', async () => {
    const { user } = renderRoute('/teacher/users');

    await user.click(await screen.findByRole('link', { name: /Ada Lovelace/ }));

    expect(await screen.findByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument();
    expect(screen.getByText('ada')).toBeInTheDocument();
  });

  it('shows a recoverable error when the request fails', async () => {
    server.use(http.get('*/api/users', () => new HttpResponse(null, { status: 500 })));

    renderRoute('/teacher/users');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('renders the not-found page for an unknown route', async () => {
    renderRoute('/does-not-exist');

    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});

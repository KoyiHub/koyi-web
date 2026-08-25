import { describe, expect, it } from 'vitest';

import { renderRoute, screen } from '@/test/test-utils';

describe('route auth guards', () => {
  it('redirects an unauthenticated visitor away from a teacher route to /login', async () => {
    renderRoute('/', { authenticated: false });

    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  });

  it('renders a teacher route for an authenticated visitor', async () => {
    renderRoute('/', { authenticated: true });

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('redirects an authenticated visitor away from /login to the dashboard', async () => {
    renderRoute('/login', { authenticated: true });

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('lets an unauthenticated visitor reach /login', async () => {
    renderRoute('/login', { authenticated: false });

    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  });
});

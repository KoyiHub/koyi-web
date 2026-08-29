import { describe, expect, it } from 'vitest';

import { renderRoute, screen } from '@/test/test-utils';

describe('route auth guards', () => {
  it('redirects an unauthenticated visitor away from a teacher route to /login', async () => {
    renderRoute('/teacher/dashboard', { authenticated: false });

    expect(await screen.findByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
  });

  it('renders a teacher route for an authenticated visitor', async () => {
    renderRoute('/teacher/dashboard', { authenticated: true });

    expect(await screen.findByText('Total students')).toBeInTheDocument();
  });

  // `/` is the public landing journey, outside both guards: it must render the
  // same for a signed-in teacher as for a first-time visitor.
  it('leaves an already-authenticated visitor on the public welcome page at /', async () => {
    renderRoute('/', { authenticated: true });

    expect(await screen.findByRole('heading', { name: /Welcome to Koyi/ })).toBeInTheDocument();
  });

  it('lets an unauthenticated visitor see the public welcome page at /', async () => {
    renderRoute('/', { authenticated: false });

    expect(await screen.findByRole('heading', { name: /Welcome to Koyi/ })).toBeInTheDocument();
  });

  it('redirects an authenticated visitor away from /login/teacher to the dashboard', async () => {
    renderRoute('/login/teacher', { authenticated: true });

    expect(await screen.findByText('Total students')).toBeInTheDocument();
  });

  it('lets an unauthenticated visitor reach /login/teacher', async () => {
    renderRoute('/login/teacher', { authenticated: false });

    expect(await screen.findByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
  });

  // The chooser is outside the guard: a signed-in admin must still be able to
  // pick a role rather than being bounced to the teacher dashboard.
  it('leaves an authenticated visitor on the role chooser at /login', async () => {
    renderRoute('/login', { authenticated: true });

    expect(await screen.findByRole('heading', { name: /Log in to Koyi/ })).toBeInTheDocument();
  });
});

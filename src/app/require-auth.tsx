import { Navigate, Outlet, useLocation } from 'react-router';

import { paths } from '@/config/paths';
import { getAuthToken } from '@/lib/auth/token-store';

/**
 * Guards the teacher route tree only — the student assessment session
 * (`AssessmentLayout`) is intentionally outside this boundary, since nothing
 * in the current product/session architecture requires teacher auth for it.
 */
export function RequireAuth() {
  const location = useLocation();

  if (!getAuthToken()) {
    return <Navigate to={paths.login.teacher} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

/** Keeps an already-authenticated teacher off /login and /signup. */
export function RedirectIfAuthenticated() {
  if (getAuthToken()) {
    return <Navigate to={paths.teacher.dashboard} replace />;
  }

  return <Outlet />;
}

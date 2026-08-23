import { Link } from 'react-router';

import { paths } from '@/config/paths';

export function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="text-sm font-medium text-slate-500">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        to={paths.home}
        className="mt-6 inline-block text-sm font-medium text-slate-900 underline underline-offset-4"
      >
        Go home
      </Link>
    </div>
  );
}

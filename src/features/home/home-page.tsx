import { Link } from 'react-router';

import { env } from '@/config/env';
import { paths } from '@/config/paths';

const conventions = [
  [
    'Routing',
    'Data router in src/app/routes.tsx; every page lazy-loaded; URLs in src/config/paths.ts',
  ],
  [
    'Data',
    'TanStack Query + a typed axios client; responses validated with Zod before they reach a component',
  ],
  [
    'Structure',
    'Feature-first: src/features/<feature>/{api,components,routes}. Shared code only in src/lib and src/components',
  ],
  [
    'Quality',
    'pnpm validate runs typecheck, ESLint, Prettier and Vitest — the same gate CI and the pre-commit hook run',
  ],
];

export function HomePage() {
  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">{env.VITE_APP_NAME}</h1>
      <p className="mt-2 text-slate-600">
        The development environment is wired up. Below are the conventions the scaffolding assumes.
      </p>

      <dl className="mt-8 space-y-4">
        {conventions.map(([term, description]) => (
          <div key={term} className="rounded-lg border border-slate-200 bg-white p-4">
            <dt className="font-medium text-slate-900">{term}</dt>
            <dd className="mt-1 text-sm text-slate-600">{description}</dd>
          </div>
        ))}
      </dl>

      <Link
        to={paths.users.list}
        className="mt-8 inline-block text-sm font-medium text-slate-900 underline underline-offset-4"
      >
        See the reference feature slice &rarr;
      </Link>
    </section>
  );
}

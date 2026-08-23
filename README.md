# koyi-web

React + TypeScript single-page app built with Vite.

## Getting started

```bash
nvm use                 # Node 22 (see .nvmrc)
pnpm install
cp .env.example .env.local
pnpm dev                # http://localhost:5173
```

To run the UI with no backend at all, set `VITE_ENABLE_MOCKS=true` in
`.env.local` — Mock Service Worker will serve the handlers in
[src/mocks/handlers.ts](src/mocks/handlers.ts).

## Scripts

| Command          | What it does                                           |
| ---------------- | ------------------------------------------------------ |
| `pnpm dev`       | Dev server with HMR                                    |
| `pnpm build`     | Typecheck, then production build to `dist/`            |
| `pnpm preview`   | Serve the production build locally                     |
| `pnpm typecheck` | `tsc -b --noEmit`                                      |
| `pnpm lint`      | ESLint (`lint:fix` to autofix)                         |
| `pnpm format`    | Prettier write (`format:check` to verify)              |
| `pnpm test`      | Vitest once (`test:watch`, `test:ui`, `test:coverage`) |
| `pnpm validate`  | Everything CI runs: typecheck + lint + format + test   |

## Project structure

```
src/
  app/          Router, layout, providers, error boundary — the shell
  components/   Cross-feature presentational components (ui/ = primitives)
  config/       env.ts (validated environment), paths.ts (all URLs)
  features/     One folder per domain: api/, components/, routes/
  lib/          Cross-cutting infrastructure: api client, query client, utils
  mocks/        MSW handlers, shared by tests and the browser worker
  test/         Vitest setup and render helpers
```

**Feature-first.** Everything a domain needs lives in `src/features/<name>/`.
Code moves to `src/lib` or `src/components` only once a _second_ feature needs
it — that keeps shared code genuinely shared rather than speculatively general.

Import with the `@/` alias (`@/features/users/api/queries`). ESLint rejects
`../../` climbing so a moved file doesn't rewrite half its imports.

## Routing

Routes are declared in one place — [src/app/routes.tsx](src/app/routes.tsx) —
using React Router's data router. Every page is loaded through `lazy`, so each
route ships as its own chunk and adding a page never grows the entry bundle.

URLs live in [src/config/paths.ts](src/config/paths.ts). Build links from
`paths.users.detail(id)` rather than writing `/users/${id}` inline, so renaming
a route is a one-file change.

Errors thrown anywhere under a route land in
[src/app/root-error-boundary.tsx](src/app/root-error-boundary.tsx), which keeps
the shell alive and shows the stack in dev only.

## API calls

Three layers, each with one job:

1. **[src/lib/api/client.ts](src/lib/api/client.ts)** — an axios instance plus a
   typed `api.get/post/put/patch/delete`. Auth headers are attached by an
   interceptor; every error is normalized to an `ApiError` with `status`, `code`
   and helpers like `isUnauthorized` and `isRetryable`.

2. **A Zod schema per endpoint** — every response is parsed before it is
   returned. A backend contract change fails loudly at the boundary instead of
   crashing a component three levels deep, and request/response types are
   _derived_ from the schema so they cannot drift.

3. **TanStack Query** — caching, retries and loading state. Query options are
   colocated with the feature and built through a key factory, so
   `userKeys.lists()` invalidates lists without disturbing cached detail pages.

[src/features/users](src/features/users) is a complete reference slice: schema,
queries, a mutation with invalidation, list and detail pages, and tests.

Requests go to same-origin `/api/...`. In dev the Vite proxy forwards that to
`VITE_API_PROXY_TARGET`, so there is no CORS setup and no environment-specific
host baked into the client bundle.

## Environment variables

Only `VITE_`-prefixed variables reach the browser — never put a secret in one.
They are validated at startup by [src/config/env.ts](src/config/env.ts), so a
missing or malformed variable is an immediate, named error rather than an
`undefined` that surfaces later. Import `env` from there; don't read
`import.meta.env` directly.

## Testing

Vitest + Testing Library + MSW, in jsdom. Network is intercepted at the HTTP
layer rather than by mocking modules, so tests exercise the real client, real
interceptors and real Zod validation.

[src/test/test-utils.tsx](src/test/test-utils.tsx) provides:

- `renderWithProviders(ui)` — one component with app context, no router
- `renderRoute('/users/1')` — the real route table at a URL, for navigation,
  route params and layouts

An un-mocked request fails the test rather than hanging. Override one endpoint
per test with `server.use(...)`.

## Quality gates

`pnpm validate` is the single gate, and it runs in three places:

- **pre-commit** — lint-staged runs ESLint and Prettier on staged files
- **pre-push** — typecheck
- **CI** — [.github/workflows/ci.yml](.github/workflows/ci.yml) runs the whole
  thing plus the production build

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org)
(`feat:`, `fix:`, `chore:` …), enforced by commitlint.

TypeScript runs strict, plus `noUncheckedIndexedAccess` and
`exactOptionalPropertyTypes` — the settings that catch the bugs plain `strict`
misses.

import { z } from 'zod';

/**
 * Runtime-validated environment. Importing this module fails loudly at startup
 * if a required variable is missing or malformed, instead of surfacing as an
 * `undefined` deep inside a request months later.
 */
const envSchema = z.object({
  VITE_API_URL: z.string().min(1).default('/api'),
  VITE_ENABLE_MOCKS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  VITE_APP_NAME: z.string().min(1).default('Koyi'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env = {
  ...parsed.data,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;

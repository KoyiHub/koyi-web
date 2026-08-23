import { z } from 'zod';

/**
 * The API contract, declared once. Types are derived from the schema rather
 * than hand-written, so the runtime check and the compile-time type can never
 * drift apart.
 */
export const userSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.email(),
  username: z.string(),
});

export const userListSchema = z.array(userSchema);

export type User = z.infer<typeof userSchema>;

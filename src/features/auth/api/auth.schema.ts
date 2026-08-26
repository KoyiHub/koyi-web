import { z } from 'zod';

/**
 * Mirrors `apps.users.serializers.UserSerializer` exactly — a UUID id and
 * split first/last name, not the numeric-id demo `User` in
 * `features/users`, so it is a distinct type rather than a reuse.
 */
export const authUserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  first_name: z.string(),
  last_name: z.string(),
  full_name: z.string(),
  email_verified: z.boolean(),
  created_at: z.string(),
});

export type AuthUser = z.infer<typeof authUserSchema>;

/** `apps.users.views.LoginView` response — SimpleJWT pair plus the custom `user` claim. */
export const tokenPairResponseSchema = z.object({
  access: z.string(),
  refresh: z.string(),
  user: authUserSchema,
});

export type TokenPairResponse = z.infer<typeof tokenPairResponseSchema>;

/** `TokenRefreshView` response. `ROTATE_REFRESH_TOKENS` is on, so a new refresh token is issued too. */
export const refreshResponseSchema = z.object({
  access: z.string(),
  refresh: z.string(),
});

export type RefreshResponse = z.infer<typeof refreshResponseSchema>;

/** `apps.users.serializers.RegisterSerializer` request body. */
export const registerRequestSchema = z
  .object({
    email: z.email('Enter a valid email address'),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirm: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  });

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

/** `RegisterView` returns the created user, with no tokens — registration does not log the user in. */
export const registerResponseSchema = authUserSchema;

export const loginRequestSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

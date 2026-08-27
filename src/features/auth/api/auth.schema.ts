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

/**
 * Teacher sign-in request. PROVISIONAL — teachers identify themselves with the
 * Teacher ID their school issued plus that school's ID, not an email address,
 * and no Django contract for this exists yet (see `api/endpoints.ts`).
 */
export const teacherLoginRequestSchema = z.object({
  teacher_id: z.string().min(1),
  school_id: z.string().min(1),
  password: z.string().min(1),
});

export type TeacherLoginRequest = z.infer<typeof teacherLoginRequestSchema>;

/**
 * Teacher sign-in response. PROVISIONAL. Shaped as the confirmed SimpleJWT
 * pair plus the school the teacher belongs to, so the app can remember the
 * School ID the backend actually accepted rather than the typed one.
 */
export const teacherLoginResponseSchema = tokenPairResponseSchema.extend({
  school_id: z.string(),
});

export type TeacherLoginResponse = z.infer<typeof teacherLoginResponseSchema>;

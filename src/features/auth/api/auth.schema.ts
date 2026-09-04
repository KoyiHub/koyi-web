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

/**
 * Teacher sign-in request.
 *
 * **A teacher signs in with their teacher id, not an email.** It is what the
 * school issued them, it carries the school abbreviation as a prefix
 * (`GHS-T-00007`), and it is globally unique — so no separate school field is
 * needed. Input is case insensitive server-side.
 */
export const teacherLoginRequestSchema = z.object({
  teacher_id: z.string().min(1),
  password: z.string().min(1),
});

export type TeacherLoginRequest = z.infer<typeof teacherLoginRequestSchema>;

/** The teacher record returned alongside the token pair. */
export const teacherAccountSchema = z.object({
  id: z.string(),
  teacher_id: z.string(),
  full_name: z.string(),
  school: z.object({
    id: z.string(),
    name: z.string(),
  }),
  school_class: z.string().nullable(),
});

export type TeacherAccount = z.infer<typeof teacherAccountSchema>;

/**
 * Teacher sign-in response — the SimpleJWT pair, the user, and the teacher.
 *
 * A wrong password, an unknown id and a disabled account all return the same
 * `401` message. That sameness is the security property: it stops the form
 * being used to discover which teacher ids exist, so the message is shown
 * verbatim and never decorated with "check your teacher id" hints.
 */
export const teacherLoginResponseSchema = z.object({
  access: z.string(),
  refresh: z.string(),
  user: authUserSchema
    .partial({
      first_name: true,
      last_name: true,
      full_name: true,
      email_verified: true,
      created_at: true,
    })
    .extend({
      id: z.string(),
      email: z.string(),
      role: z.string().optional(),
    }),
  teacher: teacherAccountSchema,
});

export type TeacherLoginResponse = z.infer<typeof teacherLoginResponseSchema>;

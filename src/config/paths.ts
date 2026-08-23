/**
 * The single source of truth for URLs. Components and tests build links from
 * here, so changing a path is one edit instead of a grep-and-pray.
 */
export const paths = {
  home: '/',
  users: {
    list: '/users',
    detail: (userId: string | number) => `/users/${String(userId)}`,
  },
} as const;

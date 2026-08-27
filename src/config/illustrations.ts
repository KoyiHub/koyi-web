/**
 * Illustrations served from `public/`, referenced by URL rather than imported
 * so the large classroom artwork stays out of the JS bundle graph.
 *
 * The filename is URL-encoded here (it contains a space) so callers never have
 * to think about it, and the original spelling stays in exactly one place.
 */
export const illustrations = {
  classroom: '/onboaarding%20image.jpg',
} as const;

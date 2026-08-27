import { Link } from 'react-router';

import { paths } from '@/config/paths';

interface ComingSoonProps {
  title: string;
  body: string;
}

/**
 * Placeholder for the top-nav pages that are linked but not yet written. The
 * nav is part of the approved design, so the links exist now; this gives them
 * an honest destination instead of a 404 or a dead anchor.
 */
function ComingSoon({ title, body }: ComingSoonProps) {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <p className="text-koyi-primary text-xs font-semibold tracking-widest uppercase">
        Coming soon
      </p>
      <h1 className="text-koyi-text mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="text-koyi-muted mt-3 text-base text-pretty">{body}</p>
      <Link
        to={paths.landing.welcome}
        className="border-koyi-border bg-koyi-card text-koyi-primary hover:bg-koyi-surface rounded-koyi-md mt-8 inline-flex h-11 items-center border px-5 text-sm font-medium transition-colors"
      >
        Back to home
      </Link>
    </section>
  );
}

export function AboutPage() {
  return (
    <ComingSoon
      title="About Koyi"
      body="The story behind Koyi — why foundational literacy and numeracy in Nigerian classrooms needs better tools, and who is building this."
    />
  );
}

export function ContactPage() {
  return (
    <ComingSoon
      title="Contact us"
      body="Ways to reach the Koyi team about bringing the platform to your school, partnerships, or support."
    />
  );
}

import type { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

/**
 * The centred white card every sign-in step sits in. Shared so the two role
 * forms and the device check keep identical width, padding and heading
 * rhythm — they are meant to read as one flow, not three screens.
 */
export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="rounded-koyi-lg border-koyi-border bg-koyi-card w-full max-w-md border p-6 shadow-sm sm:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-koyi-text text-2xl font-semibold">{title}</h1>
        <p className="text-koyi-muted mx-auto mt-1 max-w-xs text-sm text-pretty">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

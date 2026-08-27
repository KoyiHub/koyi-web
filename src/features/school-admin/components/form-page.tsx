import type { FormEventHandler, ReactNode } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, SaveIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils/cn';

interface FormSectionProps {
  title: string;
  /** Blue glyph shown in the section's tinted header strip. */
  icon: ReactNode;
  description?: string;
  children: ReactNode;
}

/**
 * One titled block of a create form — a pale header strip with a blue icon and
 * title, over a white body (design reference page 55).
 */
export function FormSection({ title, icon, description, children }: FormSectionProps) {
  return (
    <section className="rounded-koyi-xl border-koyi-border bg-koyi-card overflow-hidden border">
      <div className="bg-koyi-nav-active flex items-center gap-3 px-5 py-3.5">
        <span
          aria-hidden="true"
          className="text-koyi-primary flex size-5 items-center justify-center"
        >
          {icon}
        </span>
        <div>
          <h2 className="text-koyi-primary font-display text-sm font-bold">{title}</h2>
          {description && <p className="text-koyi-muted mt-0.5 text-xs">{description}</p>}
        </div>
      </div>

      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

/** Two fields side by side on desktop, stacked below `sm`. */
export function FormRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid gap-4 sm:grid-cols-2', className)}>{children}</div>;
}

interface FormPageProps {
  title: string;
  /** Where the back arrow and Cancel both return to. */
  backTo: string;
  backLabel: string;
  submitLabel: string;
  isSubmitting: boolean;
  /** Rendered above the footer when the request fails. */
  errorMessage?: string | null;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
}

/**
 * Shared scaffold for the School Admin create forms: back bar, a centred
 * column of sectioned cards, and a Cancel / Save footer.
 */
export function FormPage({
  title,
  backTo,
  backLabel,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  children,
}: FormPageProps) {
  return (
    <div className="mx-auto w-full max-w-220 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={backTo}
          aria-label={backLabel}
          className="border-koyi-border text-koyi-text hover:bg-koyi-card flex size-10 shrink-0 items-center justify-center rounded-full border"
        >
          <ArrowLeftIcon aria-hidden="true" className="size-4" />
        </Link>
        <h1 className="text-koyi-text font-display text-2xl font-extrabold">{title}</h1>
      </div>

      <form noValidate onSubmit={onSubmit} className="space-y-5">
        {children}

        {errorMessage && (
          <p role="alert" className="text-koyi-danger text-sm">
            {errorMessage}
          </p>
        )}

        <div className="border-koyi-border flex items-center justify-end gap-4 border-t pt-5">
          <Link to={backTo} className="text-koyi-primary text-sm font-semibold hover:underline">
            Cancel
          </Link>
          <Button type="submit" isLoading={isSubmitting}>
            <SaveIcon aria-hidden="true" className="size-4" />
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}

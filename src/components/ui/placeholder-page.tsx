interface PlaceholderPageProps {
  title: string;
  description: string;
}

/** Marks an unbuilt section so sidebar links resolve. No product UI belongs here yet. */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="rounded-koyi-lg border-koyi-border bg-koyi-card border border-dashed p-8 text-center">
      <h1 className="text-koyi-text text-xl font-semibold">{title}</h1>
      <p className="text-koyi-muted mt-2 text-sm">{description}</p>
    </section>
  );
}

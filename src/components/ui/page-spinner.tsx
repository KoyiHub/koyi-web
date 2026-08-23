export function PageSpinner() {
  return (
    <div role="status" aria-live="polite" className="flex justify-center py-16">
      <span
        aria-hidden="true"
        className="size-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"
      />
      <span className="sr-only">Loading</span>
    </div>
  );
}

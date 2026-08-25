interface TeacherTopbarProps {
  onOpenMenu: () => void;
}

/**
 * Slim context bar above the routed page content. Class context is a
 * provisional placeholder — teacher/class selection is not implemented yet.
 */
export function TeacherTopbar({ onOpenMenu }: TeacherTopbarProps) {
  return (
    <header className="border-koyi-border bg-koyi-card flex h-14 shrink-0 items-center gap-3 border-b px-4 lg:px-6">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation menu"
        className="text-koyi-text hover:bg-koyi-surface flex size-11 items-center justify-center rounded-md lg:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-5 fill-none stroke-current stroke-2"
        >
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>

      <p className="text-koyi-text text-sm font-medium">Primary 4 &middot; Class A</p>
    </header>
  );
}

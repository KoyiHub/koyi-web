/**
 * Public footer. Privacy/Terms are deliberately inert anchors — the pages do
 * not exist yet, and a router link to a missing route would 404 rather than
 * read as "coming soon".
 */
export function LandingFooter() {
  return (
    <footer className="border-koyi-border border-t">
      <div className="text-koyi-muted mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs sm:flex-row sm:px-6">
        <p>&copy; {new Date().getFullYear()} Koyi FLN Platform</p>
        <div className="flex items-center gap-4">
          <a href="#privacy" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#terms" className="hover:underline">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}

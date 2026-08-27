/**
 * Password recovery has no route and no confirmed endpoint yet, so this is
 * rendered as a visibly disabled control rather than a link to nowhere — the
 * design shows the affordance, and it should not pretend to work. Swap it for
 * a real `Link` the moment the recovery flow exists.
 */
export function ForgotPasswordLink() {
  return (
    <span
      aria-disabled="true"
      title="Password recovery is not available yet"
      className="text-koyi-primary cursor-not-allowed text-sm font-medium opacity-70"
    >
      Forgot password?
    </span>
  );
}

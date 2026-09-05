import { Link } from 'react-router';

interface ForgotPasswordLinkProps {
  to: string;
}

/** Shared styling for the "Forgot password?" link on both sign-in forms. */
export function ForgotPasswordLink({ to }: ForgotPasswordLinkProps) {
  return (
    <Link to={to} className="text-koyi-primary text-sm font-medium hover:underline">
      Forgot password?
    </Link>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { paths } from '@/config/paths';
import { useVerifySitting } from '@/features/runner/api/mutations';
import { ApiError } from '@/lib/api/errors';

/**
 * The whole authentication a child has — `frontend-integration.md` §6, §7.5.
 *
 * One error message for every failure (wrong code, not assigned, disabled,
 * already finished): distinguishing them would let the form be used to
 * discover real codes, so this deliberately does not try to be more helpful.
 * A `429` gets its own copy, since that is the rate limiter, not a wrong code.
 *
 * A guardian link arrives as `?a=<assessment>&c=<personal>` — both fields
 * auto-fill and the form auto-submits once, then the codes are stripped from
 * the URL with `history.replaceState` so they never sit in browser history.
 */
const GENERIC_ERROR = "That doesn't look right. Check both codes with your teacher and try again.";
const RATE_LIMIT_ERROR = 'Too many attempts. Please wait a minute and try again.';

export function EntryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verify = useVerifySitting();
  const [assessmentCode, setAssessmentCode] = useState(searchParams.get('a') ?? '');
  const [code, setCode] = useState(searchParams.get('c') ?? '');
  const [error, setError] = useState<string | null>(null);
  const autoSubmitted = useRef(false);

  function submit(assessment_code: string, childCode: string) {
    setError(null);
    verify.mutate(
      { assessment_code, code: childCode },
      {
        onSuccess: () => {
          void navigate(paths.assessment.instructions, { replace: true });
        },
        onError: (err) => {
          const status = err instanceof ApiError ? err.status : 0;
          setError(status === 429 ? RATE_LIMIT_ERROR : GENERIC_ERROR);
        },
      },
    );
  }

  useEffect(() => {
    const a = searchParams.get('a');
    const c = searchParams.get('c');
    if (autoSubmitted.current || !a || !c) return;
    autoSubmitted.current = true;
    window.history.replaceState(null, '', window.location.pathname);
    submit(a, c);
    // Runs once, on mount, off whatever the URL carried at load — not a
    // reactive effect over the fields the child can still edit by hand.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
      <div className="border-koyi-border rounded-2xl border bg-white p-8 shadow-sm sm:p-10">
        <h1 className="font-display text-koyi-text text-center text-2xl font-bold sm:text-3xl">
          Let's get started
        </h1>
        <p className="text-koyi-muted mt-2 text-center text-sm">
          Ask your teacher for your two codes.
        </p>

        <form
          className="mt-8 flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            submit(assessmentCode, code);
          }}
        >
          <TextField
            label="Assessment code"
            placeholder="KRPX7T"
            autoComplete="off"
            autoCapitalize="characters"
            value={assessmentCode}
            onChange={(event) => {
              setAssessmentCode(event.target.value);
            }}
            required
          />
          <TextField
            label="Your code"
            placeholder="9M4X2B"
            autoComplete="off"
            autoCapitalize="characters"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
            }}
            required
          />

          {error && (
            <p role="alert" className="text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <Button type="submit" isLoading={verify.isPending} className="mt-2 h-12 text-base">
            Start
          </Button>
        </form>
      </div>
    </div>
  );
}

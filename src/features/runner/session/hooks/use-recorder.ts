import { useCallback, useEffect, useRef, useState } from 'react';

import type { QuizRecording } from '@/features/runner/session/fln-session-fixture';

/**
 * Captures a child's spoken answer with the real microphone.
 *
 * The flow is deliberately one button: pressing it asks the browser for
 * permission and starts recording, pressing it again stops and hands back a
 * `QuizRecording`. The clip is kept as a blob object URL so it can be played
 * back locally; the backend will receive the same blob once an upload endpoint
 * exists (CLAUDE.md: never guess endpoints, so nothing is posted yet).
 *
 * Every failure path resolves to a status the UI can explain in a child-legible
 * sentence rather than an exception.
 */

export type RecorderStatus =
  | 'idle'
  | 'requesting'
  | 'recording'
  /** The browser has no MediaRecorder — the question falls back to skippable. */
  | 'unsupported'
  /** The child or the browser refused microphone access. */
  | 'denied'
  /** Permission was granted but capture failed. */
  | 'failed';

const STATUS_MESSAGES: Partial<Record<RecorderStatus, string>> = {
  unsupported: 'This browser cannot record audio. You can move on to the next question.',
  denied: 'Microphone access was blocked. Allow the microphone, then try again.',
  failed: 'The recording did not save. Please try again.',
};

export interface UseRecorderResult {
  status: RecorderStatus;
  isRecording: boolean;
  /** Whole seconds elapsed, for the on-screen timer. */
  elapsedSeconds: number;
  /** Null unless something went wrong. */
  message: string | null;
  start: () => void;
  stop: () => void;
}

function recorderAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function'
  );
}

export function useRecorder(onRecorded: (recording: QuizRecording) => void): UseRecorderResult {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef(0);
  // Held in a ref so starting a recording never depends on a fresh callback
  // identity — the button would otherwise restart mid-capture on re-render.
  const onRecordedRef = useRef(onRecorded);
  useEffect(() => {
    onRecordedRef.current = onRecorded;
  }, [onRecorded]);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  // Never leave the microphone open when the child leaves the question.
  useEffect(() => releaseStream, [releaseStream]);

  useEffect(() => {
    if (status !== 'recording') {
      return;
    }
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 250);
    return () => {
      window.clearInterval(timer);
    };
  }, [status]);

  const start = useCallback(() => {
    if (!recorderAvailable()) {
      setStatus('unsupported');
      return;
    }
    setStatus('requesting');
    setElapsedSeconds(0);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        recorder.addEventListener('dataavailable', (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        });

        recorder.addEventListener('stop', () => {
          const durationMs = Date.now() - startedAtRef.current;
          releaseStream();
          setStatus('idle');

          if (chunks.length === 0) {
            setStatus('failed');
            return;
          }
          const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
          onRecordedRef.current({
            url: URL.createObjectURL(blob),
            mimeType: blob.type,
            durationMs,
          });
        });

        recorder.addEventListener('error', () => {
          releaseStream();
          setStatus('failed');
        });

        streamRef.current = stream;
        recorderRef.current = recorder;
        startedAtRef.current = Date.now();
        recorder.start();
        setStatus('recording');
      })
      .catch((error: unknown) => {
        releaseStream();
        const denied = error instanceof DOMException && error.name === 'NotAllowedError';
        setStatus(denied ? 'denied' : 'failed');
      });
  }, [releaseStream]);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      return;
    }
    releaseStream();
    setStatus('idle');
  }, [releaseStream]);

  return {
    status,
    isRecording: status === 'recording',
    elapsedSeconds,
    message: STATUS_MESSAGES[status] ?? null,
    start,
    stop,
  };
}

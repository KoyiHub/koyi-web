import { useCallback, useEffect, useRef, useState } from 'react';

import type { ListenPrompt } from '@/features/runner/session/fln-session-fixture';

/**
 * Plays a Listen prompt.
 *
 * Two sources, one interface. If the prompt carries an `audioUrl` the browser
 * plays that recording — this is the path the backend will use once real
 * narration is recorded. Until then it falls back to the browser's own
 * speech synthesiser, which is what makes the Listen buttons work today with
 * no assets and no endpoint.
 *
 * Callers only ever see `speak`, `stop`, `isPlaying` and `isSupported`, so
 * moving from synthesised to recorded audio changes nothing in the screens.
 */

type SpeechState = 'idle' | 'playing';

function synthesisAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export interface UseSpeechResult {
  speak: (prompt: ListenPrompt) => void;
  stop: () => void;
  isPlaying: boolean;
  /** False when neither recorded audio nor synthesis can run — hide nothing, just no-op. */
  isSupported: boolean;
}

export function useSpeech(): UseSpeechResult {
  const [state, setState] = useState<SpeechState>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (synthesisAvailable()) {
      window.speechSynthesis.cancel();
    }
    setState('idle');
  }, []);

  // Nothing should keep talking after the child moves to the next question.
  useEffect(() => stop, [stop]);

  const speak = useCallback(
    (prompt: ListenPrompt) => {
      stop();

      if (prompt.audioUrl) {
        const audio = new Audio(prompt.audioUrl);
        audioRef.current = audio;
        audio.addEventListener('ended', () => {
          setState('idle');
        });
        audio.addEventListener('error', () => {
          setState('idle');
        });
        void audio.play().catch(() => {
          setState('idle');
        });
        setState('playing');
        return;
      }

      if (!synthesisAvailable()) {
        return;
      }

      const utterance = new SpeechSynthesisUtterance(prompt.text);
      // Slower and slightly higher than default: these are early readers, and
      // the words are being modelled for them to copy.
      utterance.rate = 0.85;
      utterance.pitch = 1.05;
      utterance.lang = 'en-NG';
      utterance.addEventListener('end', () => {
        setState('idle');
      });
      utterance.addEventListener('error', () => {
        setState('idle');
      });
      window.speechSynthesis.speak(utterance);
      setState('playing');
    },
    [stop],
  );

  return {
    speak,
    stop,
    isPlaying: state === 'playing',
    isSupported: synthesisAvailable() || typeof Audio !== 'undefined',
  };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { secondsToHms } from '../services/submissionService';

/**
 * Hook de countdown baseado em segundos vindos do backend.
 * O backend é a fonte da verdade: use o valor de /flags/get-timer.
 */
export default function useFlagsTimer(initialSeconds = 0) {
  const [seconds, setSeconds] = useState(Number(initialSeconds || 0));
  const intervalRef = useRef(null);

  const tick = useCallback(() => {
    setSeconds((prev) => Math.max(0, prev - 1));
  }, []);

  const start = useCallback((secs) => {
    const s = Number(secs ?? seconds) || 0;
    setSeconds(s);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (s > 0) {
      intervalRef.current = setInterval(tick, 1000);
    }
  }, [tick, seconds]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback((secs = 0) => {
    stop();
    start(secs);
  }, [start, stop]);

  useEffect(() => {
    if (seconds <= 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [seconds]);

  useEffect(() => () => stop(), [stop]);

  const formatted = secondsToHms(seconds);

  return {
    seconds,
    ...formatted, // hours, minutes, seconds, hhmmss
    start,
    stop,
    reset,
  };
}

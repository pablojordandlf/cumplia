import { useState, useEffect, useMemo } from 'react';

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * useCountdown — returns the remaining time until the given target date.
 * Updates every second. Returns all zeros once the target is reached.
 */
export function useCountdown(targetDate?: Date): CountdownResult {
  const deadline = useMemo(
    () => targetDate ?? new Date('2026-08-02T00:00:00'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetDate?.getTime()],
  );

  const [t, setT] = useState<CountdownResult>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = deadline.getTime() - Date.now();
      if (diff <= 0) {
        setT({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setT({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return t;
}

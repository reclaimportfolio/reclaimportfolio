import { useEffect, useRef } from "react";

export function useVisiblePolling(callback, intervalMs, { immediate = true } = {}) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    let intervalId = null;
    let active = true;

    const run = () => {
      if (active && !document.hidden) callbackRef.current?.();
    };

    const schedule = () => {
      if (intervalId) window.clearInterval(intervalId);
      intervalId = null;
      if (!document.hidden && intervalMs > 0) {
        intervalId = window.setInterval(run, intervalMs);
      }
    };

    const handleVisibilityChange = () => {
      schedule();
      if (!document.hidden) run();
    };

    if (immediate) run();
    schedule();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      if (intervalId) window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [immediate, intervalMs]);
}

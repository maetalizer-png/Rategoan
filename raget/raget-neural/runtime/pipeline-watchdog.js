export const WATCHDOG_MS = 5000;

export function armWatchdog(now, limit) {
  const start = now || 0;
  const ms = limit || WATCHDOG_MS;
  return {
    armed: start,
    limit: ms,
    recreate: true,
    expired(at) { return (at || 0) - start >= ms; },
  };
}

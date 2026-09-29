import { useSyncExternalStore } from 'react';
import { todayKey } from '@/domain/dates';

// Bleibt die App über Mitternacht offen oder kommt aus dem Hintergrund, wechselt „heute“ automatisch
const subscribe = (cb: () => void) => {
  const iv = setInterval(cb, 60_000);
  document.addEventListener('visibilitychange', cb);
  window.addEventListener('focus', cb);
  return () => {
    clearInterval(iv);
    document.removeEventListener('visibilitychange', cb);
    window.removeEventListener('focus', cb);
  };
};

export function useToday(): string {
  return useSyncExternalStore(subscribe, todayKey);
}

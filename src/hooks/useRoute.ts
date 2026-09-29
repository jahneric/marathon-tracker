import { useSyncExternalStore } from 'react';
import type { DateKey } from '@/domain/dates';

export const TABS = ['heute', 'plan', 'statistik', 'infos', 'mehr'] as const;
export type Tab = (typeof TABS)[number];

export interface Route {
  tab: Tab;
  /** nur bei „heute“: angezeigter Tag (fehlt = heute) */
  date?: DateKey;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseHash(hash: string): Route {
  const [, tab, arg] = hash.replace(/^#/, '').split('/');
  const t = (TABS as readonly string[]).includes(tab ?? '') ? (tab as Tab) : 'heute';
  return t === 'heute' && arg && DATE_RE.test(arg) ? { tab: t, date: arg } : { tab: t };
}

export const routeHref = (r: Route): string => `#/${r.tab}${r.date ? `/${r.date}` : ''}`;

/** Navigation über den Hash – so funktionieren Zurück-Taste und Wischgesten auch in der installierten App */
export function navigate(r: Route, { replace = false } = {}) {
  const href = routeHref(r);
  if (location.hash === href) return;
  if (replace) history.replaceState(null, '', href);
  else history.pushState(null, '', href);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  window.addEventListener('popstate', cb);
  return () => {
    window.removeEventListener('hashchange', cb);
    window.removeEventListener('popstate', cb);
  };
};

export function useHash(): string {
  return useSyncExternalStore(subscribe, () => location.hash);
}

import { useEffect } from 'react';
import type { Theme } from '@/store/types';

/** Setzt data-theme und passt die Farbe der Statusleiste an */
export function useTheme(theme: Theme) {
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);

    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
    const apply = () => {
      if (meta) meta.content = getComputedStyle(document.body).backgroundColor;
    };
    apply();
    const mq = matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
}

import { RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/ui/Button';
import { toast } from '@/ui/feedback';
import styles from './UpdatePrompt.module.css';

/** Meldet, wenn eine neue Version bereitsteht, und prüft stündlich auf Updates */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      if (reg) setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast('App ist jetzt offline verfügbar');
      setOfflineReady(false);
    }
  }, [offlineReady, setOfflineReady]);

  if (!needRefresh) return null;
  return (
    <div className={styles.banner} role="status">
      <RefreshCw aria-hidden className={styles.icon} />
      <span className="grow">Neue Version verfügbar</span>
      <Button size="sm" variant="ghost" onClick={() => setNeedRefresh(false)}>
        Später
      </Button>
      <Button size="sm" variant="primary" onClick={() => updateServiceWorker(true)}>
        Aktualisieren
      </Button>
    </div>
  );
}

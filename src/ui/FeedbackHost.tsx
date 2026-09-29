import { useEffect, useRef, useSyncExternalStore } from 'react';
import { Button } from './Button';
import { feedbackStore } from './feedback';
import styles from './FeedbackHost.module.css';

export function FeedbackHost() {
  const { toast, confirm } = useSyncExternalStore(feedbackStore.subscribe, feedbackStore.get);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (confirm && !d.open) d.showModal();
    if (!confirm && d.open) d.close();
  }, [confirm]);

  return (
    <>
      <div className={styles.toastRegion} aria-live="polite">
        {toast && (
          <div key={toast.id} className={styles.toast}>
            {toast.message}
          </div>
        )}
      </div>

      <dialog
        ref={dialog}
        className={styles.dialog}
        onCancel={e => {
          e.preventDefault();
          confirm?.resolve(false);
        }}
        onClick={e => {
          if (e.target === e.currentTarget) confirm?.resolve(false);
        }}
      >
        {confirm && (
          <div className={styles.dialogBody}>
            <h2 className={styles.dialogTitle}>{confirm.title}</h2>
            <p className="text-2">{confirm.message}</p>
            <div className={styles.dialogActions}>
              <Button variant="ghost" onClick={() => confirm.resolve(false)}>
                Abbrechen
              </Button>
              <Button variant={confirm.danger ? 'danger' : 'primary'} className={confirm.danger ? styles.dangerSolid : undefined} onClick={() => confirm.resolve(true)} autoFocus>
                {confirm.confirmLabel}
              </Button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

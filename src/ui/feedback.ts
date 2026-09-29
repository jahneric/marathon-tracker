// Globale Toasts und Bestätigungsdialoge – aufrufbar von überall, gerendert von <FeedbackHost/>

export interface ToastState { id: number; message: string }
export interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  danger: boolean;
  resolve: (ok: boolean) => void;
}

interface FeedbackState {
  toast: ToastState | null;
  confirm: ConfirmState | null;
}

let state: FeedbackState = { toast: null, confirm: null };
const listeners = new Set<() => void>();
let toastTimer: ReturnType<typeof setTimeout> | undefined;

function set(patch: Partial<FeedbackState>) {
  state = { ...state, ...patch };
  listeners.forEach(l => l());
}

export const feedbackStore = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function toast(message: string) {
  clearTimeout(toastTimer);
  set({ toast: { id: Date.now(), message } });
  toastTimer = setTimeout(() => set({ toast: null }), 2400);
}

export function confirmDialog(opts: { title: string; message: string; confirmLabel?: string; danger?: boolean }): Promise<boolean> {
  return new Promise(resolve => {
    set({
      confirm: {
        title: opts.title,
        message: opts.message,
        confirmLabel: opts.confirmLabel ?? 'OK',
        danger: opts.danger ?? false,
        resolve: ok => {
          set({ confirm: null });
          resolve(ok);
        },
      },
    });
  });
}

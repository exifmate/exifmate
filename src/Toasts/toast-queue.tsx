import { emit, listen } from '@tauri-apps/api/event';
import { ToastQueue } from 'react-stately';

export interface ToastContent {
  level: 'error' | 'success' | 'warning';
  timeout?: number;
  message: string;
}

export const _toastQueue = new ToastQueue<ToastContent>({
  maxVisibleToasts: 5,
});

const TOAST_SENT_EVENT = 'toast:sent';

export const showToast = (toast: ToastContent) =>
  emit(TOAST_SENT_EVENT, { toast });

listen<{ toast: ToastContent }>(TOAST_SENT_EVENT, (res) => {
  _toastQueue.add(res.payload.toast, { timeout: res.payload.toast.timeout });
});

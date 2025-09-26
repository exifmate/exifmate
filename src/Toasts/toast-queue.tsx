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

const EVENT_NAME = 'toast-sent';

export const showToast = (toast: ToastContent) => emit(EVENT_NAME, { toast });

export const onToast = (cb: (toast: ToastContent) => void) =>
  listen<{ toast: ToastContent }>(EVENT_NAME, (res) => {
    cb(res.payload.toast);
  });

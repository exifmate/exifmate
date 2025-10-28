import { ToastQueue } from 'react-stately';

export interface ToastContent {
  level: 'error' | 'success' | 'warning';
  timeout?: number;
  message: string;
}

export const _toastQueue = new ToastQueue<ToastContent>({
  maxVisibleToasts: 5,
});

export function showToast(toast: ToastContent) {
  _toastQueue.add(toast, { timeout: toast.timeout });
}

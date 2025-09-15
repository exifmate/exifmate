import type { UnlistenFn } from '@tauri-apps/api/event';
import { useEffect, useRef } from 'react';
import { type AriaToastRegionProps, useToastRegion } from 'react-aria';
import { createPortal } from 'react-dom';
import { useToastQueue } from 'react-stately';
import Toast from './Toast';
import { _toastQueue, onToast, type ToastContent } from './toast-queue';

function useToastState(): ReturnType<typeof useToastQueue<ToastContent>> {
  const state = useToastQueue<ToastContent>(_toastQueue);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    onToast((toast) => {
      state.add(toast);
    }).then((newUnlisten) => {
      unlisten = newUnlisten;
    });

    return () => {
      unlisten?.();
    };
  }, [state.add]);

  return state;
}

function ToastRegion(props: AriaToastRegionProps) {
  const state = useToastState();
  const ref = useRef(null);
  const { regionProps } = useToastRegion(props, state, ref);

  if (state.visibleToasts.length === 0) {
    return null;
  }

  return createPortal(
    <div {...regionProps} ref={ref} className="toast toast-center">
      {state.visibleToasts.map((toast) => (
        <Toast key={toast.key} toast={toast} state={state} />
      ))}
    </div>,
    document.body,
  );
}

export default ToastRegion;

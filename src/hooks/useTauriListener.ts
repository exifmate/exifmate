import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { useEffect } from 'react';

function useTauriListener<T>(eventName: string, cb: (payload: T) => void) {
  useEffect(() => {
    let didCancel = false;
    let unlisten: UnlistenFn | undefined;

    listen<T>(eventName, (res) => {
      cb(res.payload);
    })
      .then((u) => {
        if (didCancel) {
          u();
        } else {
          unlisten = u;
        }
      })
      .catch((err) => {
        console.error(
          `Failed to create Tauri listener for event ${eventName}:`,
          err,
        );
      });

    return () => {
      didCancel = true;
      unlisten?.();
    };
  }, [eventName, cb]);
}

export default useTauriListener;

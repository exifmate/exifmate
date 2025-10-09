import { onOpenSettings } from '@app/platform/app-menu';
import { Dialog, useDialog } from '@ark-ui/react/dialog'
import { Portal } from '@ark-ui/react/portal'
import type { UnlistenFn } from "@tauri-apps/api/event";
import { useEffect } from "react";

function SettingsModal() {
  const dialog = useDialog();

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    onOpenSettings(() => {
      dialog.setOpen(true);
    }).then((u) => {
      unlisten = u
    });

    return () => {
      unlisten?.();
    };
  }, [dialog.setOpen]);

  return (
    <Dialog.RootProvider
      value={dialog}
      lazyMount
      unmountOnExit
    >
      <Portal>
        <Dialog.Positioner
          className="fixed top-0 bottom-0 left-0 right-0 bg-black/40 flex justify-center items-center"
        >
          <Dialog.Content className="card card-border bg-base-100 w-4xl fade-in-out">
            <Dialog.Description className="card-body">
              <Dialog.Title className="card-title">Dialog Title</Dialog.Title>

              <div>
                Dialog Description
              </div>
            </Dialog.Description>

            <Dialog.CloseTrigger>
              close
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  );
}

export default SettingsModal;

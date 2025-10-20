import Dialog from '@components/Dialog';
import Modal from '@components/Modal';
import { onOpenSettings } from '@platform/app-menu';
import type { UnlistenFn } from '@tauri-apps/api/event';
import { useEffect } from 'react';
import { useOverlayTriggerState } from 'react-stately';
import SettingsForm from './SettingsForm';

function SettingsModal() {
  const modalState = useOverlayTriggerState({ defaultOpen: false });

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    onOpenSettings(() => {
      modalState.open();
    }).then((u) => {
      unlisten = u;
    });

    return () => {
      unlisten?.();
    };
  }, [modalState.open]);

  return (
    <Modal state={modalState} isDismissable>
      <Dialog title="Settings">
        <SettingsForm onSubmit={() => modalState.close()}>
          <div className="card-actions justify-end mt-3">
            <button
              className="btn btn-neutral btn-sm"
              type="button"
              onClick={() => modalState.close()}
            >
              Cancel
            </button>

            <button className="btn btn-primary btn-sm" type="submit">
              Save
            </button>
          </div>
        </SettingsForm>
      </Dialog>
    </Modal>
  );
}

export default SettingsModal;

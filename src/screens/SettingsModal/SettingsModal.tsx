import Dialog from '@components/Dialog';
import Modal from '@components/Modal';
import useTauriListener from '@hooks/useTauriListener';
import { OPEN_SETTINGS_EVENT } from '@platform/app-menu';
import { useOverlayTriggerState } from 'react-stately';
import SettingsForm from './SettingsForm';

function SettingsModal() {
  const modalState = useOverlayTriggerState({ defaultOpen: false });

  useTauriListener(OPEN_SETTINGS_EVENT, () => {
    modalState.open();
  });

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

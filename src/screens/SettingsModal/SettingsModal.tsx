import { Modal } from '@heroui/react';
import useTauriListener from '@hooks/useTauriListener';
import { OPEN_SETTINGS_EVENT } from '@platform/menus/app-menu';
import { useState } from 'react';
import SettingsForm from './SettingsForm';

function SettingsModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useTauriListener(OPEN_SETTINGS_EVENT, () => {
    setIsOpen(true);
  });

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <Modal.Container scroll="inside" size="lg">
        <SettingsForm onClose={() => setIsOpen(false)} />
      </Modal.Container>
    </Modal.Backdrop>
  );
}

export default SettingsModal;

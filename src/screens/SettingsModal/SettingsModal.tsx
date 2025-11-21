import { Modal, ModalContent, useDisclosure } from '@heroui/react';
import useTauriListener from '@hooks/useTauriListener';
import { OPEN_SETTINGS_EVENT } from '@platform/app-menu';
import SettingsForm from './SettingsForm';

function SettingsModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useTauriListener(OPEN_SETTINGS_EVENT, () => {
    onOpen();
  });

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="5xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => <SettingsForm onClose={onClose} />}
      </ModalContent>
    </Modal>
  );
}

export default SettingsModal;

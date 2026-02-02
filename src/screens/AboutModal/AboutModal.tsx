import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@heroui/react';
import useTauriListener from '@hooks/useTauriListener';
import { exiftoolVersion, perlVersion } from '@metadata-handler/exiftool';
import { OPEN_ABOUT_EVENT } from '@platform/menus/app-menu';
import { version as appVersion } from '../../../src-tauri/tauri.conf.json';
import useSWR from 'swr';
import AppIcon from '../../../app-icon.svg?url';

console.log('shit yeah', AppIcon);
function AboutModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const exiftoolVersionRes = useSWR('exiftool-version', exiftoolVersion, {
    revalidateOnFocus: false,
    onError(err) {
      console.error('Failed to get exiftool version:', err);
    },
  });

  const perlVersionRes = useSWR('perl-version', perlVersion, {
    revalidateOnFocus: false,
    onError(err) {
      console.error('Failed to get perl version:', err);
    },
  });

  useTauriListener(OPEN_ABOUT_EVENT, () => {
    onOpen();
  });

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>About ExifMate</ModalHeader>
        <ModalBody>
          <img src={AppIcon} alt="" />

          <div>{appVersion}</div>

          <div>
            {exiftoolVersionRes.isLoading && '...'}
            {exiftoolVersionRes.data && exiftoolVersionRes.data}
            {exiftoolVersionRes.error && 'failed to get exiftool version'}
          </div>

          <div>
            {perlVersionRes.isLoading && '...'}
            {perlVersionRes.data && perlVersionRes.data}
            {perlVersionRes.error && 'failed to get perl version'}
          </div>
        </ModalBody>

        {/* {(onClose) => <p>hello</p>} */}
      </ModalContent>
    </Modal>
  );
}

export default AboutModal;

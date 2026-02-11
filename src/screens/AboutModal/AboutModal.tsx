import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@heroui/react';
import useTauriListener from '@hooks/useTauriListener';
import { exiftoolVersion, perlVersion } from '@metadata-handler/exiftool';
import { OPEN_ABOUT_EVENT } from '@platform/menus/app-menu';
import { getVersion } from '@tauri-apps/api/app';
import useSWR from 'swr';
import AppIcon from '../../../app-icon.svg?url';

console.log('shit yeah', AppIcon);
function AboutModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const appVersionRes = useSWR('app-version', getVersion, {
    revalidateOnFocus: false,
    onError(err) {
      console.error('Failed to get app version:', err);
    },
  });

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

          <div>
            {appVersionRes.isLoading && '...'}
            {appVersionRes.data && appVersionRes.data}
            {appVersionRes.error && 'failed to get app version'}
          </div>

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

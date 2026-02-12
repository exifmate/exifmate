import {
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Skeleton,
  useDisclosure,
} from '@heroui/react';
import useTauriListener from '@hooks/useTauriListener';
import { exiftoolVersion, perlVersion } from '@metadata-handler/exiftool';
import { OPEN_ABOUT_EVENT } from '@platform/menus/app-menu';
import { getVersion } from '@tauri-apps/api/app';
import useSWR, { type SWRResponse } from 'swr';
import AppIcon from '../../../app-icon.svg?url';

interface InfoLineProps {
  res: SWRResponse;
  label: string;
}

function InfoLine({ res, label }: InfoLineProps) {
  return (
    <div className="flex items-end gap-2">
      <span className="font-semibold">{label}</span>

      <Skeleton className="min-w-14" isLoaded={!res.isLoading}>
        {res.data && res.data}
        {res.error && <span className="text-danger italic">Error Loading</span>}
      </Skeleton>
    </div>
  );
}

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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>About ExifMate</ModalHeader>
        <ModalBody>
          <div className="flex w-full items-center gap-4">
            <Image
              src={AppIcon}
              alt="ExifMate Icon"
              className="h-20 w-20"
              height={80}
              width={80}
            />

            <div className="grow">
              <InfoLine res={appVersionRes} label="ExifMate Version:" />
              <InfoLine res={exiftoolVersionRes} label="ExifTool Version" />
              <InfoLine res={perlVersionRes} label="Perl Version" />
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default AboutModal;

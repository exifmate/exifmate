import Center from '@components/Center';
import { Button, Chip, ListBox } from '@heroui/react';
import useTauriListener from '@hooks/useTauriListener';
import type { ImageInfo } from '@platform/file-manager';
import { findImages, IMAGES_OPENED_EVENT } from '@platform/file-manager';
import { useState } from 'react';
import { HiCheck, HiPlus } from 'react-icons/hi2';
import ImageCard from './ImageCard';

interface Props {
  onImageSelection: (images: ImageInfo[]) => void;
}

/*
 * May want to look into lazy loading the images or `Virtualizer` from react-aria.
 */
function ImageGridPanel({ onImageSelection }: Props) {
  const [images, setImages] = useState<ImageInfo[]>([]);

  useTauriListener(
    IMAGES_OPENED_EVENT,
    ({ images }: { images: ImageInfo[] }) => {
      setImages(images);
    },
  );

  if (images.length === 0) {
    return (
      <Center>
        <Button onPress={findImages} variant="tertiary" size="lg">
          <HiPlus size={24} />
          Open Files
        </Button>
      </Center>
    );
  }

  return (
    <div className="p-2">
      <ListBox
        items={images}
        aria-label="Image Grid"
        selectionMode="multiple"
        selectionBehavior="replace"
        onSelectionChange={(selection) => {
          if (selection instanceof Set) {
            const newSelectedImages = images.filter((i) =>
              selection.has(i.path),
            );
            onImageSelection(newSelectedImages);
          } else {
            onImageSelection(images);
          }
        }}
        className="flex flex-wrap flex-row gap-1"
      >
        {(image) => (
          <ListBox.Item
            id={image.path}
            textValue={image.path}
            className="w-fit data-selected:bg-default group p-2 rounded-field"
            aria-label={image.filename}
          >
            <ListBox.ItemIndicator
              color="primary"
              className="absolute top-5 left-3 z-10"
            >
              {({ isSelected }) =>
                isSelected && (
                  <Chip
                    size="lg"
                    variant="primary"
                    color="accent"
                    className="p-1 rounded-full"
                  >
                    <HiCheck className="w-5 h-5" />
                  </Chip>
                )
              }
            </ListBox.ItemIndicator>
            <div
              className="group-data-selected:scale-93 motion-safe:transition-transform"
              key={image.path}
            >
              <ImageCard path={image.path} filename={image.filename} />
            </div>
          </ListBox.Item>
        )}
      </ListBox>
    </div>
  );
}

export default ImageGridPanel;

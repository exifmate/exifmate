import Center from '@components/Center';
import { Chip, Listbox, ListboxItem } from '@heroui/react';
import useTauriListener from '@hooks/useTauriListener';
import type { ImageInfo } from '@platform/file-manager';
import { IMAGES_OPENED_EVENT } from '@platform/file-manager';
import { useState } from 'react';
import { HiCheck } from 'react-icons/hi2';
import ImageCard from './ImageCard';

interface Props {
  onImageSelection: (images: ImageInfo[]) => void;
}

/*
 * I think this'll go slow if the images are large; need to test.
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
        <p className="text-large">No Images Loaded</p>
      </Center>
    );
  }

  return (
    <div className="p-2">
      <Listbox
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
        classNames={{
          list: 'flex flex-wrap flex-row',
        }}
      >
        {(image) => (
          <ListboxItem
            key={image.path}
            textValue={image.path}
            variant="bordered"
            selectedIcon={(p) => {
              if (!p.isSelected) {
                return null;
              }

              return (
                <Chip color="primary" size="md" classNames={{ base: 'p-0' }}>
                  <HiCheck />
                </Chip>
              );
            }}
            classNames={{
              selectedIcon: 'absolute top-2 left-2 z-10',
              base: 'w-fit data-selected:bg-default group',
            }}
          >
            <div className="group-data-selected:scale-93 motion-safe:transition-transform">
              <ImageCard path={image.path} filename={image.filename} />
            </div>
          </ListboxItem>
        )}
      </Listbox>
    </div>
  );
}

export default ImageGridPanel;

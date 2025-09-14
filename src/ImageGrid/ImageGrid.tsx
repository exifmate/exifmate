import Center from '@app/components/Center';
import GridList from '@app/components/GridList';
import type { ImageInfo } from '@app/core/file-manager';
import { onImagesOpened } from '@app/core/file-manager';
import type { UnlistenFn } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';
import { Item } from 'react-stately';
import ImageCard from './ImageCard';

interface Props {
  onImageSelection: (images: ImageInfo[]) => void;
}

/*
 * I think this'll go slow if the images are large; need to test.
 * May want to look into lazy loading the images or `Virtualizer` from react-aria.
 */
function ImageGrid({ onImageSelection }: Props) {
  const [images, setImages] = useState<ImageInfo[]>([]);

  useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    onImagesOpened((newImages) => {
      setImages(newImages);
    }).then((clean) => {
      unlisten = clean;
    });

    return () => {
      unlisten?.();
    };
  }, []);

  if (images.length === 0) {
    return (
      <Center>
        <p className="text-lg">No Images Loaded</p>
      </Center>
    );
  }

  return (
    <div className="flex overflow-scroll p-4">
      <GridList
        items={images}
        aria-label="Image Grid"
        selectionMode="multiple"
        selectionBehavior="replace"
        data-testid="test-gridlist"
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
      >
        {(image) => (
          <Item key={image.path} textValue={image.filename}>
            <ImageCard path={image.path} filename={image.filename} />
          </Item>
        )}
      </GridList>
    </div>
  );
}

export default ImageGrid;

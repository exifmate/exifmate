import Center from '@app/components/Center';
import { useImageSelection } from '@app/ImageContext';
import { Item } from 'react-stately';
import GridList from './GridList';
import ImageCard from './ImageCard';

/*
 * I think this'll go slow if the images are large; need to test.
 * May want to look into lazy loading the images or `Virtualizer` from react-aria.
 */
function ImageGrid() {
  const { images, setSelectedImages } = useImageSelection();

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
            setSelectedImages(newSelectedImages);
          } else {
            setSelectedImages(images);
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

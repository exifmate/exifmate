import { Item } from 'react-stately';
import Center from '../components/Center';
import { useImageSelection } from '../ImageContext';
import GridList from './GridList';

/*
 * I think this'll go slow if the images are large; need to test.
 * May want to convert to thumbnail size base64 in Rust, but that might
 * be slow going too, but probably ultimately better.
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
            <div className="card card-xs w-56 bg-neutral">
              <figure>
                <img
                  src={image.assetUrl}
                  alt={image.filename}
                  className="h-56 w-56 object-cover"
                  height={288}
                  width={288}
                />
              </figure>

              <div className="card-body">
                <div className="card-title">{image.filename}</div>
              </div>
            </div>
          </Item>
        )}
      </GridList>
    </div>
  );
}

export default ImageGrid;

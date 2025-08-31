import classNames from 'classnames';
import Center from '../components/Center';
import { useImageSelection } from '../ImageContext';

/*
 * I think this'll go slow if the images are large; need to test.
 * May want to convert to thumbnail size base64 in Rust, but that might
 * be slow going too, but probably ultimately better.
 */
const ImageGrid = () => {
  const { images, selectedImages, handleImageSelection } = useImageSelection();

  if (images.length === 0) {
    return (
      <Center>
        <p className="text-lg">No Images Loaded</p>
      </Center>
    );
  }

  return (
    <div className="flex flex-1 overflow-scroll p-4">
      <ul className="flex flex-wrap gap-4">
        {images.map((image) => {
          const isSelected: boolean = !!selectedImages.find(
            (i) => i.path === image.path,
          );

          return (
            <li key={image.path}>
              {/* biome-ignore lint/a11y/useSemanticElements: I don't want to do this now */}
              <button
                type="button"
                onClick={(e) => {
                  handleImageSelection(e, image);
                }}
                role="checkbox"
                aria-checked={isSelected}
                className={classNames(
                  'card card-xs w-56 bg-neutral cursor-pointer',
                  { 'outline-primary outline-2 outline-offset-3': isSelected },
                )}
              >
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
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ImageGrid;

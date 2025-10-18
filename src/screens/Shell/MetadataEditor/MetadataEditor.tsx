import Center from '@app/components/Center';
import { readMetadata } from '@app/metadata-handler/read';
import type { ImageInfo } from '@app/platform/file-manager';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ExifForm from './ExifForm';

interface Props {
  selectedImages: ImageInfo[];
}

function MetadataEditor({ selectedImages }: Props) {
  if (selectedImages.length === 0) {
    return (
      <Center>
        <p className="text-lg">No Image Selected</p>
      </Center>
    );
  }

  const exifDataPromise = readMetadata(selectedImages);

  return (
    <ErrorBoundary
      fallback={
        <Center>
          <div role="alert" className="alert alert-error alert-soft">
            Error Loading Metadata
          </div>
        </Center>
      }
    >
      <Suspense
        fallback={
          <Center>
            <div className="loading loading-xl text-accent motion-reduce:hidden"></div>
            <p className="text-lg">Loading Metadata...</p>
          </Center>
        }
      >
        <ExifForm
          exifDataPromise={exifDataPromise}
          selectedImages={selectedImages}
        />
      </Suspense>
    </ErrorBoundary>
  );
}

export default MetadataEditor;

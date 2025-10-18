import Center from '@components/Center';
import { readMetadata } from '@metadata-handler/read';
import type { ImageInfo } from '@platform/file-manager';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import MetadataForm from './MetadataForm';

interface Props {
  selectedImages: ImageInfo[];
}

function MetadataEditorPanel({ selectedImages }: Props) {
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
        <MetadataForm
          exifDataPromise={exifDataPromise}
          selectedImages={selectedImages}
        />
      </Suspense>
    </ErrorBoundary>
  );
}

export default MetadataEditorPanel;

import Center from '@components/Center';
import type { ExifData } from '@metadata-handler/exifdata';
import { readMetadata } from '@metadata-handler/read';
import type { ImageInfo } from '@platform/file-manager';
import { useEffect, useState } from 'react';
import MetadataForm from './MetadataForm';

type ExifDataRes =
  | {
      state: 'loading' | 'failed';
    }
  | {
      state: 'resolved';
      data: ExifData;
    };

interface Props {
  selectedImages: ImageInfo[];
}

function MetadataEditorPanel({ selectedImages }: Props) {
  const [exifDataRes, setExifDataRes] = useState<ExifDataRes>({
    state: 'loading',
  });

  useEffect(() => {
    if (selectedImages.length === 0) {
      return;
    }

    setExifDataRes({ state: 'loading' });

    readMetadata(selectedImages)
      .then((data) => setExifDataRes({ data, state: 'resolved' }))
      .catch((err) => {
        console.error('Failed reading metadata for selection:', err);
        setExifDataRes({ state: 'failed' });
      });
  }, [selectedImages]);

  if (selectedImages.length === 0) {
    return (
      <Center>
        <p className="text-lg">No Image Selected</p>
      </Center>
    );
  }

  if (exifDataRes.state === 'loading') {
    return (
      <Center>
        <div className="loading loading-xl text-accent motion-reduce:hidden"></div>
        <p className="text-lg">Loading Metadata...</p>
      </Center>
    );
  }

  if (exifDataRes.state === 'failed') {
    return (
      <Center>
        <div role="alert" className="alert alert-error alert-soft">
          Error Loading Metadata
        </div>
      </Center>
    );
  }

  return (
    exifDataRes.state === 'resolved' && (
      <MetadataForm
        exifData={exifDataRes.data}
        selectedImages={selectedImages}
      />
    )
  );
}

export default MetadataEditorPanel;

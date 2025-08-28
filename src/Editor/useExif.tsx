import { useCallback, useEffect, useState } from 'react';
import { readMetadata, updateMetadata } from '../core/metadata-handler';
import type { ExifData, ImageInfo } from '../core/types';

type Activity = 'idle' | 'active' | 'errored';

function useExif(images: ImageInfo[]) {
  const [loadingStatus, setLoadingStatus] = useState<Activity>('idle');
  const [exif, setExif] = useState<ExifData | null>(null);

  const fetchMetadata = useCallback(async () => {
    try {
      const res = await readMetadata(images);
      setLoadingStatus('idle');
      setExif(res);
    } catch {
      setLoadingStatus('errored');
    }
  }, [images]);

  useEffect(() => {
    if (!images.length) {
      return;
    }

    setLoadingStatus('active');
    setExif(null);
    fetchMetadata();
  }, [fetchMetadata, images]);

  const saveMetadata = useCallback(
    async (newExif: ExifData) => {
      if (images.length === 0) {
        return;
      }

      try {
        await updateMetadata(images, newExif);
        await fetchMetadata();
      } catch (err) {
        console.log('err', err);

        // notifications.show({
        //   title: 'Failed saving an image',
        //   message: `Images: ${images.map((i) => i.filename).join(', ')}`,
        //   color: 'red',
        // });
      }
    },
    [images, fetchMetadata],
  );

  return {
    loadingStatus,
    exif,
    setExif,
    saveMetadata,
  };
}

export default useExif;

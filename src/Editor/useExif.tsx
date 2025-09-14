import { showNotification } from '@app/core/events';
import { readMetadata, updateMetadata } from '@app/core/metadata-handler';
import type { ExifData, ImageInfo } from '@app/core/types';
import { useCallback, useEffect, useState } from 'react';

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
        console.error('Failed saving:', err);
        await showNotification({
          level: 'error',
          message: `Failed to save images: ${images.map((i) => i.filename).join(', ')}`,
        });
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

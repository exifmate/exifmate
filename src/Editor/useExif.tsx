import type { ExifData } from '@app/metadata-handler/exifdata';
import { readMetadata } from '@app/metadata-handler/read';
import { updateMetadata } from '@app/metadata-handler/update';
import type { ImageInfo } from '@app/platform/file-manager';
import { showToast } from '@app/Toasts/toast-queue';
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
      } catch (err) {
        console.error('Failed saving:', err);
        await showToast({
          level: 'error',
          message: 'Failed to save images',
        });

        return;
      }

      try {
        await fetchMetadata();
      } catch (err) {
        console.error('Failed refreshing metadata:', err);
        await showToast({
          level: 'warning',
          message: 'Failed refreshing metadata after saving',
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

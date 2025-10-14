import { showToast } from '@app/Toasts/toast-queue';
import { emit, listen } from '@tauri-apps/api/event';
import { basename } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';

export interface ImageInfo {
  filename: string;
  path: string;
}

const IMAGES_OPENED_EVENT = 'images:opened';

export const onImagesOpened = (cb: (images: ImageInfo[]) => void) =>
  listen<{ images: ImageInfo[] }>(IMAGES_OPENED_EVENT, (res) => {
    cb(res.payload.images);
  });

export const imagesOpened = (images: ImageInfo[]) =>
  emit(IMAGES_OPENED_EVENT, { images });

export async function findImages() {
  try {
    const paths = await open({ multiple: true });
    if (!paths) {
      return;
    }

    const images: ImageInfo[] = await Promise.all(
      paths.map(
        async (path): Promise<ImageInfo> => ({
          path,
          filename: await basename(path),
        }),
      ),
    );

    await imagesOpened(images);
  } catch (err) {
    console.error('Failed adding images:', err);
    await showToast({ level: 'error', message: 'Failed adding images' });
  }
}

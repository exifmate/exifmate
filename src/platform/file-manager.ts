import { showToast } from '@app/Toasts/toast-queue';
import { emit, listen } from '@tauri-apps/api/event';
import { basename } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import { isMobile } from './util';

export interface ImageInfo {
  filename: string;
  path: string;
}

const EVENT_NAME = 'images-opened';

export const onImagesOpened = (cb: (images: ImageInfo[]) => void) =>
  listen<{ images: ImageInfo[] }>(EVENT_NAME, (res) => {
    cb(res.payload.images);
  });

export const imagesOpened = (images: ImageInfo[]) =>
  emit(EVENT_NAME, { images });

export async function findImages() {
  try {
    const paths = await open({ multiple: true });
    if (!paths) {
      return;
    }

    const images: ImageInfo[] = await Promise.all(
      paths.map(async (path): Promise<ImageInfo> => {
        const filePath = isMobile() ? new URL(path).pathname : path;

        return {
          path,
          filename: await basename(filePath),
        };
      }),
    );

    await imagesOpened(images);
  } catch (err) {
    console.error('Failed adding images:', err);
    await showToast({ level: 'error', message: 'Failed adding images' });
  }
}

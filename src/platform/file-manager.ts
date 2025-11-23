import { addToast } from '@heroui/react';
import { emit } from '@tauri-apps/api/event';
import { basename } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';

export interface ImageInfo {
  filename: string;
  path: string;
}

export const IMAGES_OPENED_EVENT = 'images:opened';

const imagesOpened = (images: ImageInfo[]) =>
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
    addToast({ color: 'danger', title: 'Failed adding images' });
  }
}

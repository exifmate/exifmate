import { invoke } from '@tauri-apps/api/core';
import { emit } from '@tauri-apps/api/event';
import { basename } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import { reportError } from './error-reporter';

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
    reportError('Failed adding images', err);
  }
}

export async function genThumbnail(path: string): Promise<string> {
  const data = await invoke('gen_thumbnail', { path });

  if (data instanceof ArrayBuffer) {
    return URL.createObjectURL(new Blob([data]));
  }

  throw new Error('Incorrect data type returned for thumbnail');
}

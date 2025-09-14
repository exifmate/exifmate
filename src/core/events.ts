import { emit, listen, type UnlistenFn } from '@tauri-apps/api/event';
import type { ImageInfo } from './types';

type onImagesOpened = (
  cb: (images: ImageInfo[]) => void,
) => Promise<UnlistenFn>;

export const onImagesOpened: onImagesOpened = (cb) =>
  listen<{ images: ImageInfo[] }>('images-opened', (res) => {
    cb(res.payload.images);
  });

export const imagesOpened = (images: ImageInfo[]) =>
  emit('images-opened', { images });

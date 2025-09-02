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

export interface Notification {
  level: 'success' | 'error';
  message: string;
}

export const showNotification = (notification: Notification) =>
  emit('notification-sent', { notification });

type onNotification = (
  cb: (notification: Notification) => void,
) => Promise<UnlistenFn>;

export const onNotification: onNotification = (cb) =>
  listen<{ notification: Notification }>('notification-sent', (res) => {
    cb(res.payload.notification);
  });

import { basename } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import { imagesOpened } from './events';
import { isMobile } from './util';

export interface ImageInfo {
  filename: string;
  path: string;
}

export async function findImages() {
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
}

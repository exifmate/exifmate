import { basename } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import { imagesOpened } from './events';
import type { ImageInfo } from './types';
import { isMobile } from './util';

// const SUPPORTED_TYPES = /jpe?g$/i;

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

// export async function findImages() {
//   // TODO: this will need to change to be directory false on mobile
//   // but maybe support mobile so this can return the same thing?
//   const path = await open({ directory: true });
//   if (!path) {
//     return;
//   }

//   const dirEntry = await readDir(path);
//   const relevantFiles = dirEntry.filter((e) => {
//     if (e.isFile) {
//       return SUPPORTED_TYPES.test(e.name);
//     }

//     return false;
//   });
//   const images: ImageInfo[] = relevantFiles.map((f) => {
//     // idk if this is very cross platform
//     const assetUrl = convertFileSrc(`${path}/${f.name}`);
//     return {
//       assetUrl,
//       filename: f.name,
//     };
//   });

//   await emit('files-selected', { images });
// }

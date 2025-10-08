import type { ImageInfo } from '@app/platform/file-manager';
import { invoke } from '@tauri-apps/api/core';
import type { ExifData } from './exifdata';

// TODO: should consider making empty values be nulled
// TODO: need to notify on partial failure (then use `allSettled`)
export async function updateMetadata(
  images: ImageInfo[],
  newData: Partial<ExifData>,
) {
  await invoke('write_metadata', {
    newData,
    imgPaths: images.map((i) => i.path),
  });
}

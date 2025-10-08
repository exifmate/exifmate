import type { ImageInfo } from '@app/platform/file-manager';
import { invoke } from '@tauri-apps/api/core';
import { ExifData } from './exifdata';

export async function readMetadata(
  images: ImageInfo[],
): Promise<ExifData | null> {
  const allMetadata = await invoke('read_metadata', {
    imgPaths: images.map((i) => i.path),
  });
  // TODO: should indicate if it fails to parse or fails at exiftool (at least log)
  return ExifData.parse(allMetadata);
}

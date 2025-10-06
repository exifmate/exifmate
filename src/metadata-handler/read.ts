import type { ImageInfo } from '@app/platform/file-manager';
import { invoke } from '@tauri-apps/api/core';
import { z } from 'zod/v4';
import { ExifData } from './exifdata';

export async function readMetadata(
  images: ImageInfo[],
): Promise<ExifData | null> {
  const allMetadata = await invoke('read_metadata', {
    imgPaths: images.map((i) => i.path),
  });
  // TODO: should indicate if it fails to parse or fails at exiftool (at least log)
  const parsed = z.array(ExifData).parse(allMetadata);
  return aggregateExif(parsed);
}

export function aggregateExif(items: ExifData[]): ExifData {
  const result: ExifData = {};

  if (items.length === 0) {
    return result;
  }

  const allKeys = new Set<keyof ExifData>();

  for (const item of items) {
    for (const key in item) {
      allKeys.add(key as keyof ExifData);
    }
  }

  for (const key of allKeys) {
    const commonValue = items[0][key];

    const allValuesAreSame = items.every((item) => {
      const currentValue = item[key];
      return currentValue === commonValue;
    });

    if (allValuesAreSame) {
      (result as Record<keyof ExifData, unknown>)[key] = commonValue;
    }
  }

  return result;
}

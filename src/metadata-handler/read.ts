import type { ImageInfo } from '@app/platform/file-manager';
import { ExifData } from './exifdata';
import { execute } from './exiftool';

export async function readMetadata(
  images: ImageInfo[],
): Promise<ExifData | null> {
  const imgPaths = images.map((i) => i.path);
  const output = await execute([
    '-json',
    '-c',
    '%+.9f',
    ...imgPaths,
  ]);

  const parsed = JSON.parse(output);
  const allMetadata = aggregateExif(parsed);

  // TODO: should indicate if it fails to parse or fails at exiftool (at least log)
  return ExifData.parse(allMetadata);
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

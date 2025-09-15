import type { ImageInfo } from '@app/platform/file-manager';
import { readFile } from '@tauri-apps/plugin-fs';
import { parseMetadata } from '@uswriting/exiftool';
import zeroperl from '../../vendor/zeroperl-1.0.0.wasm?url';
import { ExifData } from './exifdata';

async function readImageMetadata({
  path,
  filename,
}: ImageInfo): Promise<ExifData> {
  const binary = await readFile(path);
  const readTags = ExifData.keyof().options.map((tag) => `-${tag}`);

  try {
    const readResult = await parseMetadata(
      { name: filename, data: binary },
      {
        args: [...readTags, '-json', '-c', '%+.9f'],
        transform: (data) => JSON.parse(data),
        fetch: () => fetch(zeroperl),
      },
    );

    // TODO: handle this separately from reading
    // (maybe be more graceful about invalid data too)
    return ExifData.parseAsync(readResult.data[0]);
  } catch (err) {
    throw new Error(`Failed to read exif data for ${path}: ${err}`);
  }
}

export async function readMetadata(
  images: ImageInfo[],
): Promise<ExifData | null> {
  const reads: Promise<ExifData>[] = images.map((i) => readImageMetadata(i));
  const allMetadata = await Promise.all(reads);
  return aggregateExif(allMetadata);
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

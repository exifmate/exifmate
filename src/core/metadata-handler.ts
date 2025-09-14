import { BaseDirectory, readFile, writeFile } from '@tauri-apps/plugin-fs';
import { parseMetadata, writeMetadata } from '@uswriting/exiftool';
import zeroperl from '../../vendor/zeroperl-1.0.0.wasm?url';
import type { ImageInfo } from './file-manager';
import { type ExifData, exifData } from './types';
import { aggregateExif, isMobile } from './util';

async function readImageMetadata({
  path,
  filename,
}: ImageInfo): Promise<ExifData> {
  const binary = await readFile(path);
  const readTags = exifData.keyof().options.map((tag) => `-${tag}`);

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
    return exifData.parseAsync(readResult.data[0]);
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

// TODO: should consider making empty values be nulled
async function updateImageMetadata(
  { path, filename }: ImageInfo,
  newData: Partial<ExifData>,
) {
  const binary = await readFile(path);

  // This might be better as not a loop
  const tagsToSave: Record<string, string | number> = {};

  for (const [tag, val] of Object.entries(newData)) {
    if (tag === 'GPSLatitude') {
      tagsToSave['GPSLatitude*'] = val;
    } else if (tag === 'GPSLongitude') {
      tagsToSave['GPSLongitude*'] = val;
    } else {
      tagsToSave[tag] = val;
    }
  }

  // TODO: probably should validate before trying to save
  const writeResult = await writeMetadata(
    { name: filename, data: binary },
    tagsToSave,
    { fetch: () => fetch(zeroperl) },
  );

  // @ts-expect-error
  if (writeResult.warnings) {
    // @ts-expect-error
    console.debug(writeResult.warnings); // TODO: should notify for warnings too
  }

  if (!writeResult.success) {
    console.error('Save error:', writeResult.error);
    throw new Error(`Failed to set metadata: ${writeResult.error}`);
  }

  const data = new Uint8Array(writeResult.data);

  if (isMobile()) {
    await writeFile(filename, data, {
      baseDir: BaseDirectory.Document,
    });
  } else {
    await writeFile(path, data);
  }
}

// TODO: need to notify on partial failure (then use `allSettled`)
export async function updateMetadata(
  images: ImageInfo[],
  newData: Partial<ExifData>,
) {
  const updates: Promise<void>[] = images.map((i) =>
    updateImageMetadata(i, newData),
  );
  await Promise.all(updates);
}

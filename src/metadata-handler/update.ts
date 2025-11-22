import type { ImageInfo } from '@platform/file-manager';
import type { ExifData } from './exifdata';
import { execute } from './exiftool';

let isSaving = false;

export async function updateMetadata(
  images: ImageInfo[],
  newData: Partial<ExifData>,
) {
  if (isSaving) {
    return;
  }

  isSaving = true;

  const imgPaths = images.map((i) => i.path);
  const tagArgs = Object.keys(newData).map((key) => {
    let value = newData[key as keyof ExifData];
    if (value === undefined || value === null) {
      value = '';
    } else if (typeof value === 'string') {
      value = value.trim();
    }

    if (key === 'GPSLatitude') {
      return `-GPSLatitude*=${value}`;
    } else if (key === 'GPSLongitude') {
      return `-GPSLongitude*=${value}`;
    }
    return `-${key}=${value}`;
  });

  try {
    await execute(['-c', '%+.9f', ...tagArgs, ...imgPaths]);
  } finally {
    isSaving = false;
  }
}

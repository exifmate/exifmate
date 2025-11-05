import type { ImageInfo } from '@platform/file-manager';
import type { ExifData } from './exifdata';
import { execute } from './exiftool';

// TODO: should consider making empty values be nulled
export async function updateMetadata(
  images: ImageInfo[],
  newData: Partial<ExifData>,
) {
  const imgPaths = images.map((i) => i.path);
  const tagArgs = Object.keys(newData).map((key) => {
    let value = newData[key as keyof ExifData];
    if (value === undefined) {
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

  await execute(['-c', '%+.9f', ...tagArgs, ...imgPaths]);
}

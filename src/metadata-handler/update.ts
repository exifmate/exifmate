import type { ImageInfo } from '@app/platform/file-manager';
import type { ExifData } from './exifdata';
import { execute } from './exiftool';

// TODO: should consider making empty values be nulled
export async function updateMetadata(
  images: ImageInfo[],
  newData: Partial<ExifData>,
) {
  const imgPaths = images.map((i) => i.path);
  const tagArgs = Object.keys(newData).map((key) => {
    if (key === 'GPSLatitude') {
      return `-GPSLatitude*=${newData[key]}`;
    } else if (key === 'GPSLongitude') {
      return `-GPSLongitude*=${newData[key]}`;
    }
    return `-${key}=${newData[key as keyof ExifData]}`;
  });

  await execute(['-c', '%+.9f', ...tagArgs, ...imgPaths]);
}

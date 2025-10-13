import type { ImageInfo } from '@app/platform/file-manager';
import { Command } from '@tauri-apps/plugin-shell';
import type { ExifData } from './exifdata';

// TODO: should consider making empty values be nulled
export async function updateMetadata(
  images: ImageInfo[],
  newData: Partial<ExifData>,
) {
  const imgPaths = images.map((i) => i.path);
  const tagArgs = Object.keys(newData)
    .map((key) => {
      if (key === 'GPSLatitude') {
        return `-GPSLatitude*=${newData[key]}`;
      } else if (key === 'GPSLongitude') {
        return `-GPSLongitude*=${newData[key]}`
      }
      return `-${key}=${newData[key as keyof ExifData]}`
    });

  const res = await Command.create(
    'exiftool',
    [
      '-q',
      '-c',
      '%+.9f',
      ...tagArgs,
      ...imgPaths,
    ],
  ).execute();

  if (res.stderr || res.code !== 0) {
    throw new Error(res.stderr);
  }
}

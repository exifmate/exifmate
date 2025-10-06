import type { ExifData } from '../exifdata';
import { aggregateExif, readMetadata } from '../read';

describe('readMetadata', () => {
  it.todo('calls a Tauri command to read metadata');

  describe('when reading multiple images', () => {
    it.todo('aggregates the common metadata of images', async () => {
      const exif = await readMetadata([
        { path: '/image-one.jpg', filename: 'image-one' },
        { path: '/image-two.jpg', filename: 'image-two' },
      ]);

      // undefined is treated as different
      expect(exif).toEqual({ Make: 'Test' });
    });
  });

  describe('when exiftool was unsuccessful', () => {
    it.todo('can notify of that', async () => {
      await expect(async () => {
        await readMetadata([{ path: '/image-one.jpg', filename: '' }]);
      }).rejects.toThrowError('Failed to read exif data for /image-one.jpg');
    });
  });
});

describe('aggregateExif', () => {
  it('aggregates the given exif data', () => {
    const test: ExifData[] = [
      {
        Artist: '',
        ImageDescription: 'test',
        Make: 'foo',
        Orientation: 'Horizontal (normal)',
        WhiteBalance: 'Auto',
      },
      {
        Artist: '',
        ImageDescription: 'test',
        Make: 'bar',
        Orientation: 'Horizontal (normal)',
        WhiteBalance: 'Auto',
      },
      {
        Artist: '',
        ImageDescription: 'test',
        Make: 'foo',
        WhiteBalance: 'Auto',
      },
    ];

    const expected: ExifData = {
      Artist: '',
      ImageDescription: 'test',
      WhiteBalance: 'Auto',
    };

    expect(aggregateExif(test)).toEqual(expected);
  });
});

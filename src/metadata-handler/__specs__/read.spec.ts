import { fs } from 'memfs';
import { ImageOne, ImageTwo } from 'test-support/fake-images';
import type { ExifData } from '../exifdata';
import { aggregateExif, readMetadata } from '../read';

vi.mock('@tauri-apps/plugin-fs');

describe('readMetadata', () => {
  beforeEach(async () => {
    await Promise.all([
      fs.promises.writeFile('/image-one.jpg', ImageOne),
      fs.promises.writeFile('/image-two.jpg', ImageTwo),
    ]);
  });

  test.each([
    {
      file: 'image-one.jpg',
      expectedData: {
        Make: 'Test',
        Model: 'Test Model',
        CreateDate: '2025-06-23 11:00:00',
      },
    },
    {
      file: 'image-two.jpg',
      expectedData: {
        Make: 'Test',
        CreateDate: '2025-06-23 12:00:00',
      },
    },
  ])('can read the metadata from an image', async ({ file, expectedData }) => {
    const exif = await readMetadata([{ path: `/${file}`, filename: file }]);

    expect(exif).toEqual(expectedData);
  });

  describe('when reading multiple images', () => {
    it('aggregates the common metadata of images', async () => {
      const exif = await readMetadata([
        { path: '/image-one.jpg', filename: 'image-one' },
        { path: '/image-two.jpg', filename: 'image-two' },
      ]);

      // undefined is treated as different
      expect(exif).toEqual({ Make: 'Test' });
    });
  });

  describe('when exiftool was unsuccessful', () => {
    it('can notify of that', async () => {
      await expect(async () => {
        await readMetadata([{ path: '/image-one.jpg', filename: '' }]);
      }).rejects.toThrowError('Failed to read exif data for /image-one.jpg');
    });
  });

  describe('when there is warnings from reading images', () => {
    it.todo('can notify of warnings parsing images');
  });

  describe('when there is invalid metadata', () => {
    it.todo('warns the user instead of erroring');
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

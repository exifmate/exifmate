import { fs } from 'memfs';
import { readMetadata, updateMetadata } from '../metadata-handler';
import type { ImageInfo } from '../types';
import { ImageOne, ImageTwo } from './fake-images';

vi.mock('@tauri-apps/plugin-fs');

vi.mock(import('../util'), async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    isMobile: vi.fn().mockReturnValue(false),
  };
});

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

describe('updateMetadata', () => {
  beforeEach(async () => {
    await Promise.all([
      fs.promises.writeFile('/image-one.jpg', ImageOne),
      fs.promises.writeFile('/image-two.jpg', ImageTwo),
    ]);
  });

  it('updates the metadata for the given images', async () => {
    const images: ImageInfo[] = [
      { path: '/image-one.jpg', filename: 'one' },
      { path: '/image-two.jpg', filename: 'two' },
    ];
    await updateMetadata(images, { FNumber: '2' });

    const exif = await readMetadata(images);
    expect(exif).toEqual(
      expect.objectContaining({ FNumber: '2', Make: 'Test' }),
    );
  });

  describe('when an image fails to save', () => {
    it.todo('indicates the error');
  });

  describe('when there is a warning', () => {
    it.todo('warns of the warning');
  });

  describe('when GPSLatitude or GPSLongitude is set', () => {
    it.todo('updates the respective ref');
  });
});

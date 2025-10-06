import type { ImageInfo } from '@app/platform/file-manager';
import { fs } from 'memfs';
import { ImageOne, ImageTwo } from 'test-support/fake-images';
import { readMetadata } from '../read';
import { updateMetadata } from '../update';

vi.mock('@tauri-apps/plugin-fs');

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

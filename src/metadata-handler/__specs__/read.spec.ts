import { ImageOne, ImageTwo } from 'test-support/fake-images';
import {
  withFixtureImage,
  withFixtureImages,
} from 'test-support/fixture-image';
import type { ExifData } from '../exifdata';
import { aggregateData, readMetadata } from '../read';

vi.mock('@tauri-apps/plugin-shell');
vi.mock('@platform/settings', () => ({
  loadSettings: vi.fn(async () => ({})),
}));

describe('readMetadata', () => {
  it('returns schema-parsed exif data from a real image', async () => {
    const info = await withFixtureImage(ImageOne);

    const result = await readMetadata([info]);

    expect(result.Make).toBe('Test');
    expect(result.Model).toBe('Test Model');
  });

  it('aggregates fields across multiple images, dropping fields that differ', async () => {
    const infos = await withFixtureImages([
      { buffer: ImageOne, filename: 'one.jpg' },
      { buffer: ImageTwo, filename: 'two.jpg' },
    ]);

    const result = await readMetadata(infos);

    expect(result.Make).toBe('Test');
    expect(result.Model).toBeUndefined();
  });

  it('rejects when exiftool cannot read the file', async () => {
    await expect(
      readMetadata([{ path: '/nonexistent/path.jpg', filename: 'missing' }]),
    ).rejects.toThrow();
  });
});

describe('aggregateData', () => {
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

    expect(aggregateData(test)).toEqual(expected);
  });
});

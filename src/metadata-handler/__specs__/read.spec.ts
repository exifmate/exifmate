import { invoke } from '@tauri-apps/api/core';
import type { Mock } from 'vitest';
import { ZodError } from 'zod/v4';
import type { ExifData } from '../exifdata';
import { aggregateExif, readMetadata } from '../read';

const mockInvoke = invoke as unknown as Mock<typeof invoke>;

vi.mock('@tauri-apps/api/core');

describe('readMetadata', () => {
  it('calls a Tauri command to read metadata', async () => {
    mockInvoke.mockResolvedValueOnce([]);
    expect(mockInvoke).not.toHaveBeenCalled();
    await readMetadata([
      { path: '/one.jpg', filename: 'image-one' },
      { path: '/two.jpg', filename: 'image-two' },
    ]);
    expect(mockInvoke).toHaveBeenCalledExactlyOnceWith('read_metadata', {
      imgPaths: ['/one.jpg', '/two.jpg'],
    });
  });

  // for some reason this only asserts that the returned is an array
  // but it drops the invalid object keys, so i don't care to look into
  it('enforces that the Tauri command returns valid data', async () => {
    mockInvoke.mockResolvedValueOnce({ not: 'valid' });
    await expect(async () => {
      await readMetadata([{ path: '/one.jpg', filename: '' }]);
    }).rejects.toThrowError(ZodError);
  });

  describe('when reading multiple images', () => {
    it('aggregates the common metadata of images', async () => {
      mockInvoke.mockResolvedValueOnce([
        { Artist: 'Foo', Make: 'Test' },
        { Artist: 'Bar', Make: 'Test' },
      ]);

      const exif = await readMetadata([
        { path: '/one.jpg', filename: 'one' },
        { path: '/two.jpg', filename: 'two' },
      ]);
      expect(exif).toEqual({ Make: 'Test' });
    });
  });

  describe('when exiftool was unsuccessful', () => {
    it('can notify of that', async () => {
      mockInvoke.mockRejectedValueOnce('no');

      await expect(async () => {
        await readMetadata([{ path: '/one.jpg', filename: '' }]);
      }).rejects.toThrowError('no');
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

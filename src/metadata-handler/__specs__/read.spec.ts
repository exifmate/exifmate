import type { Mock } from 'vitest';
import type { ExifData } from '../exifdata';
import { execute } from '../exiftool';
import { aggregateData, readMetadata } from '../read';

const mockExecute = execute as unknown as Mock<typeof execute>;
vi.mock('../exiftool');

describe('readMetadata', () => {
  it('calls exiftool read metadata', async () => {
    mockExecute.mockResolvedValueOnce('[{}]');
    expect(mockExecute).not.toHaveBeenCalled();
    await readMetadata([
      { path: '/one.jpg', filename: 'image-one' },
      { path: '/two.jpg', filename: 'image-two' },
    ]);

    const expected = expect.arrayContaining(['/one.jpg', '/two.jpg']);
    expect(mockExecute).toHaveBeenCalledExactlyOnceWith(expected);
  });

  it('enforces that the exiftool command returns valid data', async () => {
    const args = [{ path: '/one.jpg', filename: '' }];
    mockExecute.mockResolvedValueOnce(
      JSON.stringify([{ not: 'valid', Artist: 'test' }]),
    );
    const result = await readMetadata(args);
    expect(result).toEqual({ Artist: 'test' });
  });

  describe('when exiftool was unsuccessful', () => {
    it('can notify of that', async () => {
      mockExecute.mockRejectedValueOnce('no');

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

    expect(aggregateData(test)).toEqual(expected);
  });
});

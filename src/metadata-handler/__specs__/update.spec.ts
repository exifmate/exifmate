import type { Mock } from 'vitest';
import type { ExifData } from '../exifdata';
import { execute } from '../exiftool';
import { updateMetadata } from '../update';

const mockExecute = execute as unknown as Mock<typeof execute>;
vi.mock('../exiftool');

describe('updateMetadata', () => {
  it('calls exiftool to write metadata', async () => {
    expect(mockExecute).not.toHaveBeenCalled();

    const newData: ExifData = {
      Artist: ' Test ',
      GPSLatitude: 1,
      GPSLongitude: 2,
      Flash: undefined,
    };
    await updateMetadata(
      [
        { path: 'one.jpg', filename: 'one' },
        { path: 'two.jpg', filename: 'two' },
      ],
      newData,
    );

    expect(mockExecute).toHaveBeenCalledExactlyOnceWith(
      expect.arrayContaining([
        '-Artist=Test',
        '-GPSLatitude*=1',
        '-GPSLongitude*=2',
        '-Flash=',
        'one.jpg',
        'two.jpg',
      ]),
    );
  });

  describe('when an image fails to save', () => {
    it('indicates the error', async () => {
      mockExecute.mockRejectedValueOnce('no');

      await expect(async () => {
        await updateMetadata([{ path: 'one.jpg', filename: 'one' }], {});
      }).rejects.toThrowError('no');
    });
  });
});

import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ImageOne } from 'test-support/fake-images';
import { withFixtureImage } from 'test-support/fixture-image';
import { readMetadata } from '../read';
import { updateMetadata } from '../update';

vi.mock('@tauri-apps/plugin-shell');
vi.mock('@platform/settings', () => ({
  loadSettings: vi.fn(async () => ({})),
}));

import { loadSettings } from '@platform/settings';

describe('updateMetadata', () => {
  it('writes string tags with whitespace trimmed', async () => {
    const info = await withFixtureImage(ImageOne);

    await updateMetadata([info], { Artist: '  New Artist  ' });
    const reread = await readMetadata([info]);

    expect(reread.Artist).toBe('New Artist');
  });

  it('writes GPS coordinates via the *= flavor', async () => {
    const info = await withFixtureImage(ImageOne);

    await updateMetadata([info], {
      GPSLatitude: 47.6062,
      GPSLongitude: -122.3321,
    });
    const reread = await readMetadata([info]);

    expect(reread.GPSLatitude).toBeCloseTo(47.6062, 6);
    expect(reread.GPSLongitude).toBeCloseTo(-122.3321, 6);
  });

  it('clears a tag when given an empty value', async () => {
    const info = await withFixtureImage(ImageOne);

    await updateMetadata([info], { Artist: 'To Be Removed' });
    const afterSet = await readMetadata([info]);
    expect(afterSet.Artist).toBe('To Be Removed');

    await updateMetadata([info], { Artist: '' });
    const afterClear = await readMetadata([info]);
    expect(afterClear.Artist).toBeFalsy();
  });

  it('rejects when exiftool cannot write to the path', async () => {
    await expect(
      updateMetadata([{ path: '/nonexistent/path.jpg', filename: 'missing' }], {
        Artist: 'Test',
      }),
    ).rejects.toThrow(/file not found|nonexistent/i);
  });

  describe('originalFileBehavior settings', () => {
    it('leaves a backup file by default (copy_original)', async () => {
      vi.mocked(loadSettings).mockResolvedValueOnce({
        originalFileBehavior: 'copy_original',
      });
      const info = await withFixtureImage(ImageOne);

      await updateMetadata([info], { Artist: 'Backup Test' });

      const backup = join(dirname(info.path), `${info.filename}_original`);
      expect(existsSync(backup)).toBe(true);
    });

    it('does not leave a backup when overwrite_original is set', async () => {
      vi.mocked(loadSettings).mockResolvedValueOnce({
        originalFileBehavior: 'overwrite_original',
      });
      const info = await withFixtureImage(ImageOne);

      await updateMetadata([info], { Artist: 'No Backup Test' });

      const backup = join(dirname(info.path), `${info.filename}_original`);
      expect(existsSync(backup)).toBe(false);
    });
  });
});

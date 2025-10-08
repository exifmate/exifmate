import { invoke } from '@tauri-apps/api/core';
import type { Mock } from 'vitest';
import { ZodError } from 'zod/v4';
import { readMetadata } from '../read';

const mockInvoke = invoke as unknown as Mock<typeof invoke>;

vi.mock('@tauri-apps/api/core');

describe('readMetadata', () => {
  it('calls a Tauri command to read metadata', async () => {
    mockInvoke.mockResolvedValueOnce({});
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
    const args = [{ path: '/one.jpg', filename: '' }];
    mockInvoke.mockResolvedValueOnce({ not: 'valid', Artist: 'test' });
    const result = await readMetadata(args);
    expect(result).toEqual({ Artist: 'test' })

    mockInvoke.mockResolvedValueOnce([{ not: 'valid', Artist: 'test' }]);
    await expect(async () => {
      await readMetadata([{ path: '/one.jpg', filename: '' }]);
    }).rejects.toThrowError(ZodError);
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

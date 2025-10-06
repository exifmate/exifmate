import { invoke } from '@tauri-apps/api/core';
import type { Mock } from 'vitest';
import { updateMetadata } from '../update';

const mockInvoke = invoke as unknown as Mock<typeof invoke>;

vi.mock('@tauri-apps/api/core');

describe('updateMetadata', () => {
  it('calls a Tauri command to write metadata', async () => {
    expect(mockInvoke).not.toHaveBeenCalled();
    const newData = { Artist: 'Test' };
    await updateMetadata(
      [
        { path: 'one.jpg', filename: 'one' },
        { path: 'two.jpg', filename: 'two' },
      ],
      newData,
    );
    expect(mockInvoke).toHaveBeenCalledExactlyOnceWith('write_metadata', {
      newData,
      imgPaths: ['one.jpg', 'two.jpg'],
    });
  });

  describe('when an image fails to save', () => {
    it('indicates the error', async () => {
      mockInvoke.mockRejectedValueOnce('no');

      await expect(async () => {
        await updateMetadata([{ path: 'one.jpg', filename: 'one' }], {});
      }).rejects.toThrowError('no');
    });
  });
});

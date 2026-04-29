import { toast } from '@heroui/react';
import { findImages, IMAGES_OPENED_EVENT } from '@platform/file-manager';
import { listen } from '@tauri-apps/api/event';
import { mockIPC } from '@tauri-apps/api/mocks';
import { basename } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import { waitFor } from '@testing-library/react';
import type { Mock } from 'vitest';

vi.mock('@tauri-apps/plugin-dialog');
vi.mock('@tauri-apps/api/path');
vi.mock(import('@heroui/react'), async (importOriginal) => {
  const original = await importOriginal();
  original.toast.danger = vi.fn();
  return original;
});

const openMock = open as unknown as Mock<typeof open>;
const basenameMock = basename as unknown as Mock<typeof basename>;
const toastMock = toast as unknown as Mock<typeof toast>;

describe('findImages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIPC(() => {}, { shouldMockEvents: true });
  });

  it('emits images:opened with the dialog-selected paths', async () => {
    openMock.mockResolvedValueOnce(['/a/foo.jpg', '/b/bar.jpg']);
    basenameMock.mockImplementation(async (p) => p.split('/').pop() ?? '');

    const handler = vi.fn();
    await listen(IMAGES_OPENED_EVENT, (event) => handler(event.payload));

    await findImages();

    await waitFor(() =>
      expect(handler).toHaveBeenCalledExactlyOnceWith({
        images: [
          { path: '/a/foo.jpg', filename: 'foo.jpg' },
          { path: '/b/bar.jpg', filename: 'bar.jpg' },
        ],
      }),
    );
  });

  it('does nothing when the dialog returns no paths', async () => {
    openMock.mockResolvedValueOnce(null);

    const handler = vi.fn();
    await listen(IMAGES_OPENED_EVENT, handler);

    await findImages();

    expect(handler).not.toHaveBeenCalled();
    expect(toastMock.danger).not.toHaveBeenCalled();
  });

  it('toasts when the dialog fails', async () => {
    vi.stubGlobal('console', { error: () => {} });
    openMock.mockRejectedValueOnce(new Error('boom'));

    await findImages();

    expect(toastMock.danger).toHaveBeenCalledExactlyOnceWith(
      'Failed adding images',
    );
  });
});

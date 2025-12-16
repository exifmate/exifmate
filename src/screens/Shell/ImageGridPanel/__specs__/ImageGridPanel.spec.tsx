import { IMAGES_OPENED_EVENT } from '@platform/file-manager';
import { emit } from '@tauri-apps/api/event';
import { mockIPC } from '@tauri-apps/api/mocks';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fs } from 'memfs';
import { ImageOne, ImageTwo } from 'test-support/fake-images';
import ImageGridPanel from '../ImageGridPanel';

vi.mock('@platform/file-manager');
vi.mock('@tauri-apps/plugin-fs');
vi.stubGlobal('URL', {
  createObjectURL: vi.fn().mockReturnValue('blobby'),
});

describe('ImageGridPanel', () => {
  beforeEach(async () => {
    mockIPC(() => {}, { shouldMockEvents: true });

    await Promise.all([
      fs.promises.writeFile('/image1.jpg', ImageOne),
      fs.promises.writeFile('/image2.jpg', ImageTwo),
    ]);
  });

  it('has a message when no images are opened', () => {
    render(<ImageGridPanel onImageSelection={vi.fn()} />);
    expect(screen.getByText('No Images Loaded')).toBeVisible();
  });

  describe('when there are opened images', () => {
    it('lists the images', async () => {
      render(<ImageGridPanel onImageSelection={vi.fn()} />);

      await act(async () => {
        await emit(IMAGES_OPENED_EVENT, {
          images: [
            {
              filename: 'image1.jpg',
              path: '/image1.jpg',
            },
            {
              filename: 'image2.jpg',
              path: '/image2.jpg',
            },
          ],
        });
      });

      expect(screen.queryByText('No Images Loaded')).toBeNull();

      expect(await screen.findByAltText('image1.jpg thumbnail')).toBeVisible();
      expect(screen.getByAltText('image2.jpg thumbnail')).toBeVisible();
    });

    it('can select an image', async () => {
      const imageSelection = vi.fn();
      render(<ImageGridPanel onImageSelection={imageSelection} />);

      await act(async () => {
        await emit(IMAGES_OPENED_EVENT, {
          images: [
            {
              filename: 'image1.jpg',
              path: '/image1.jpg',
            },
            {
              filename: 'image2.jpg',
              path: '/image2.jpg',
            },
          ],
        });
      });

      const image = await screen.findByLabelText('image1.jpg');
      expect(image).toHaveAttribute('aria-selected', 'false');

      await userEvent.click(image);
      expect(image).toHaveAttribute('aria-selected', 'true');
      expect(imageSelection).toHaveBeenCalledExactlyOnceWith([
        {
          filename: 'image1.jpg',
          path: '/image1.jpg',
        },
      ]);
    });
  });
});

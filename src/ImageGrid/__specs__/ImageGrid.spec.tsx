import { ImageOne, ImageTwo } from '@app/core/__specs__/fake-images';
import type { onImagesOpened } from '@app/core/events';
import { ImageProvider } from '@app/ImageContext';
import type { load } from '@tauri-apps/plugin-store';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fs } from 'memfs';
import ImageGrid from '../ImageGrid';

vi.mock('@tauri-apps/plugin-fs');
vi.mock('@tauri-apps/plugin-store', () => ({
  load: vi.fn<typeof load>(() => new Promise(() => {})),
}));

vi.stubGlobal('URL', {
  createObjectURL: vi.fn(),
});

vi.mock(import('@app/core/events'), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    onImagesOpened: vi.fn<typeof onImagesOpened>((cb) => {
      cb([
        {
          filename: 'image1.jpg',
          path: '/image1.jpg',
        },
        {
          filename: 'image2.jpg',
          path: '/image2.jpg',
        },
      ]);
      return Promise.resolve(() => {});
    }),
  };
});

describe('ImageGrid', () => {
  beforeEach(async () => {
    await Promise.all([
      fs.promises.writeFile('/image1.jpg', ImageOne),
      fs.promises.writeFile('/image2.jpg', ImageTwo),
    ]);
  });

  it('has a message when no images are opened', () => {
    render(<ImageGrid />);
    expect(screen.getByText('No Images Loaded')).toBeVisible();
  });

  describe('when there are opened images', () => {
    it('lists the images', async () => {
      render(
        <ImageProvider>
          <ImageGrid />
        </ImageProvider>,
      );
      expect(screen.queryByText('No Images Loaded')).toBeNull();

      expect(await screen.findByAltText(`image1.jpg thumbnail`)).toBeVisible();
      expect(screen.getByAltText(`image2.jpg thumbnail`)).toBeVisible();
    });

    it('can select an image', async () => {
      render(
        <ImageProvider>
          <ImageGrid />
        </ImageProvider>,
      );

      const image = await screen.findByLabelText('image1.jpg');
      expect(image).toHaveAttribute('aria-selected', 'false');

      await userEvent.click(image);
      expect(image).toHaveAttribute('aria-selected', 'true');
    });
  });
});

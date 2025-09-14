import { onImagesOpened } from '@app/platform/file-manager';
import type { load } from '@tauri-apps/plugin-store';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fs } from 'memfs';
import { ImageOne, ImageTwo } from 'test-support/fake-images';
import type { Mock } from 'vitest';
import ImageGrid from '../ImageGrid';

const onImagesOpenedMock = onImagesOpened as unknown as Mock<
  typeof onImagesOpened
>;

vi.mock('@tauri-apps/plugin-fs');
vi.mock('@tauri-apps/plugin-store', () => ({
  load: vi.fn<typeof load>(() => new Promise(() => {})),
}));

vi.stubGlobal('URL', {
  createObjectURL: vi.fn(),
});

vi.mock(import('@app/platform/file-manager'), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    onImagesOpened: vi.fn<typeof onImagesOpened>().mockResolvedValue(() => {}),
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
    render(<ImageGrid onImageSelection={vi.fn()} />);
    expect(screen.getByText('No Images Loaded')).toBeVisible();
  });

  describe('when there are opened images', () => {
    beforeEach(() => {
      onImagesOpenedMock.mockImplementationOnce((cb) => {
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
      });
    });

    it('lists the images', async () => {
      render(<ImageGrid onImageSelection={vi.fn()} />);
      expect(screen.queryByText('No Images Loaded')).toBeNull();

      expect(await screen.findByAltText(`image1.jpg thumbnail`)).toBeVisible();
      expect(screen.getByAltText(`image2.jpg thumbnail`)).toBeVisible();
    });

    it('can select an image', async () => {
      const imageSelection = vi.fn();
      render(<ImageGrid onImageSelection={imageSelection} />);

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

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import type { ImageInfo } from '../../core/types';
import { useImageSelection } from '../../ImageContext';
import ImageGrid from '../ImageGrid';

const useImageSelectionMock = useImageSelection as unknown as Mock<
  typeof useImageSelection
>;

vi.mock('../../ImageContext.tsx', () => ({
  useImageSelection: vi.fn<typeof useImageSelection>().mockReturnValue({
    images: [],
    selectedImages: [],
    setSelectedImages: vi.fn(),
  }),
}));

describe('ImageGrid', () => {
  it('has a message when no images are opened', () => {
    render(<ImageGrid />);
    expect(screen.getByText('No Images Loaded')).toBeVisible();
  });

  describe('when there are opened images', () => {
    const fakeImages: ImageInfo[] = [
      {
        filename: 'image1.jpg',
        assetUrl: '/images/image1.jpg',
        path: '/images/image1.jpg',
      },
      {
        filename: 'image2.jpg',
        assetUrl: '/images/image2.jpg',
        path: '/images/image2.jpg',
      },
    ] as const;

    let mockSetSelectedImages: Mock;

    beforeEach(() => {
      mockSetSelectedImages = vi.fn();

      useImageSelectionMock.mockReturnValue({
        images: fakeImages,
        selectedImages: [fakeImages[0]],
        setSelectedImages: mockSetSelectedImages,
      });
    });

    it('lists the images', () => {
      render(<ImageGrid />);
      expect(screen.queryByText('No Images Loaded')).toBeNull();

      expect(screen.getByAltText(fakeImages[0].filename)).toBeVisible();
      expect(screen.getByAltText(fakeImages[1].filename)).toBeVisible();
    });

    it('can select an image', async () => {
      render(<ImageGrid />);
      const image = screen.getByLabelText(fakeImages[0].filename);

      expect(image).toHaveAttribute('aria-selected', 'false');
      expect(mockSetSelectedImages).not.toHaveBeenCalled();

      await userEvent.click(image);

      expect(mockSetSelectedImages).toHaveBeenCalledExactlyOnceWith([
        fakeImages[0],
      ]);
      expect(image).toHaveAttribute('aria-selected', 'true');
    });
  });
});

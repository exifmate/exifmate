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
    handleImageSelection: vi.fn(),
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

    let mockHandleImageSelection: Mock;

    beforeEach(() => {
      mockHandleImageSelection = vi.fn();

      useImageSelectionMock.mockReturnValue({
        images: fakeImages,
        selectedImages: [fakeImages[0]],
        handleImageSelection: mockHandleImageSelection,
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
      const selectedImage = screen.getByAltText(fakeImages[0].filename);
      const unselectedImage = screen.getByAltText(fakeImages[1].filename);

      expect(selectedImage.closest('button')).toBeVisible();
      expect(selectedImage.closest('button')).toHaveAttribute(
        'aria-checked',
        'true',
      );
      expect(unselectedImage.closest('button')).toBeVisible();
      expect(unselectedImage.closest('button')).toHaveAttribute(
        'aria-checked',
        'false',
      );

      expect(mockHandleImageSelection).not.toHaveBeenCalled();
      await userEvent.click(unselectedImage);
      expect(mockHandleImageSelection).toHaveBeenCalledExactlyOnceWith(
        expect.anything(),
        fakeImages[1],
      );
    });
  });
});

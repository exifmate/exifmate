import { toast } from '@heroui/react';
import { readMetadata } from '@metadata-handler/read';
import { updateMetadata } from '@metadata-handler/update';
import { ERROR_REPORTED_EVENT } from '@platform/error-reporter';
import type { ImageInfo } from '@platform/file-manager';
import { listen } from '@tauri-apps/api/event';
import { mockIPC } from '@tauri-apps/api/mocks';
import type { load } from '@tauri-apps/plugin-store';
import {
  render as originalRender,
  type RenderOptions,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { SWRConfig } from 'swr';
import type { Mock } from 'vitest';
import MetadataEditorPanel from '../MetadataEditorPanel';

const readMetadataMock = readMetadata as unknown as Mock<typeof readMetadata>;
const updateMetadataMock = updateMetadata as unknown as Mock<
  typeof updateMetadata
>;
const toastMock = toast as unknown as Mock<typeof toast>;

vi.mock('@tauri-apps/plugin-store', () => ({
  load: vi
    .fn<typeof load>()
    .mockResolvedValue(
      new Map() as unknown as Awaited<ReturnType<typeof load>>,
    ),
}));

vi.mock('@metadata-handler/read');
vi.mock('@metadata-handler/update');
vi.mock(import('@heroui/react'), async (importOriginal) => {
  const original = await importOriginal();
  original.toast.success = vi.fn();
  return original;
});

vi.mock('react-map-gl/maplibre');
vi.mock('@tauri-apps/api/menu');

const Wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
);

const render = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  originalRender(ui, { wrapper: Wrapper, ...options });

describe('MetadataEditorPanel', () => {
  beforeEach(() => {
    mockIPC(() => {}, { shouldMockEvents: true });
  });

  afterEach(() => {
    updateMetadataMock.mockReset();
  });

  it('indicates when no image is selected', () => {
    render(<MetadataEditorPanel selectedImages={[]} />);
    expect(screen.getByText('No Image Selected')).toBeVisible();
    expect(screen.queryByText('Loading Metadata...')).toBeNull();
  });

  describe('when images are selected', () => {
    const selectedImages: ImageInfo[] = [
      { filename: 'test.jpg', path: '/test.jpg' },
    ] as const;

    it('indicates when metadata is loading', async () => {
      readMetadataMock.mockResolvedValueOnce({});
      render(<MetadataEditorPanel selectedImages={selectedImages} />);

      expect(screen.queryByText('No Image Selected')).toBeNull();
      expect(screen.queryByText('Error Loading Metadata')).toBeNull();
      const loadingText = screen.queryByText('Loading Metadata...');
      expect(loadingText).toBeVisible();
      await waitForElementToBeRemoved(loadingText);
    });

    describe('when failing to open an image', () => {
      beforeEach(() => {
        vi.stubGlobal('console', { error: () => {} });
      });

      it('indicates failure with no form even with partial load error', async () => {
        readMetadataMock.mockRejectedValueOnce(new Error('No'));
        render(<MetadataEditorPanel selectedImages={selectedImages} />);
        await waitForElementToBeRemoved(
          screen.queryByText('Loading Metadata...'),
        );
        expect(screen.getByText('Error Loading Metadata')).toBeVisible();
        expect(screen.queryByText('No Image Selected')).toBeNull();
      });
    });

    describe('when finished loading metadata', () => {
      beforeEach(async () => {
        // Called when changing tabs but not defined in JSDOM
        Element.prototype.getAnimations = vi.fn().mockReturnValue([]);

        readMetadataMock.mockResolvedValueOnce({ Artist: 'test person' });
        render(<MetadataEditorPanel selectedImages={selectedImages} />);
        await screen.findByRole('tab', { name: 'EXIF' });
      });

      it('has tabs for the inputs', async () => {
        const exifTab = screen.getByRole('tab', { name: 'EXIF' });
        const locationTab = screen.getByRole('tab', { name: 'Location' });

        expect(exifTab).toBeVisible();
        expect(locationTab).toBeVisible();

        const artistInput = screen.getByLabelText('Artist');
        expect(artistInput).toBeVisible();

        expect(screen.queryByLabelText('GPSLatitude')).toBeNull();

        await userEvent.click(locationTab);
        expect(screen.queryByLabelText('Artist')).toBeNull();
        expect(screen.queryByLabelText('GPSLatitude')).toBeVisible();
      });

      it('has different buttons when the form is disabled', async () => {
        expect(screen.getByRole('button', { name: 'Edit' })).toBeVisible();
        expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();

        await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

        expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
        expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
      });

      it('can enable the form', async () => {
        expect(screen.getByLabelText('Artist')).toBeDisabled();
        await userEvent.click(screen.getByRole('tab', { name: 'Location' }));

        const latInput = screen.getByLabelText('GPSLatitude');
        expect(latInput).toBeDisabled();

        await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

        expect(latInput).toBeEnabled();
        await userEvent.click(screen.getByRole('tab', { name: 'EXIF' }));
        expect(screen.getByLabelText('Artist')).toBeEnabled();
      });

      describe('when form changes are cancelled', () => {
        it('resets unsaved values', async () => {
          const artistInput = screen.getByLabelText('Artist');
          expect(artistInput).toHaveValue('test person');

          await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
          await userEvent.type(artistInput, 'diff');
          expect(artistInput).toHaveValue('test persondiff');

          await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

          expect(artistInput).toBeDisabled();
          expect(artistInput).toHaveValue('test person');
        });
      });

      describe('form submission', () => {
        it('disables the form', async () => {
          await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

          const artistInput = screen.getByLabelText('Artist');
          expect(artistInput).toBeEnabled();

          await userEvent.type(artistInput, 'T');
          const saveButton = screen.getByRole('button', { name: 'Save' });
          expect(saveButton).toBeEnabled();
          await userEvent.click(saveButton);

          expect(screen.getByLabelText('Artist')).toBeDisabled();
          expect(toastMock.success).toHaveBeenCalledOnce();
        });

        it('has a saving indicator', async () => {
          let resolveUpdate: () => void = () => {};
          updateMetadataMock.mockImplementationOnce(
            () =>
              new Promise<void>((resolve) => {
                resolveUpdate = resolve;
              }),
          );

          await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
          await userEvent.type(screen.getByLabelText('Artist'), 'T');

          const saveButton = screen.getByRole('button', { name: 'Save' });
          expect(saveButton).not.toHaveAttribute('data-pending');

          await userEvent.click(saveButton);

          expect(saveButton).toHaveAttribute('data-pending', 'true');

          resolveUpdate();
          await waitFor(() =>
            expect(screen.queryByRole('button', { name: 'Save' })).toBeNull(),
          );
        });

        it('sets the form to the reread value', async () => {
          const expectedLoadedArtist = 'Funky Artist';
          readMetadataMock.mockResolvedValueOnce({
            Artist: expectedLoadedArtist,
          });

          const artistInput = screen.getByLabelText('Artist');

          expect(artistInput).not.toHaveValue(expectedLoadedArtist);
          expect(updateMetadataMock).not.toHaveBeenCalled();

          await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
          await userEvent.type(artistInput, 'Test Artist');
          await userEvent.click(screen.getByRole('button', { name: 'Save' }));

          await waitFor(() =>
            expect(artistInput).toHaveValue(expectedLoadedArtist),
          );
          expect(updateMetadataMock).toHaveBeenCalledOnce();
        });

        it('can not submit if the form is not dirty', async () => {
          await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

          const saveButton = screen.getByRole('button', { name: 'Save' });
          expect(saveButton).toBeDisabled();

          await userEvent.click(saveButton);
          expect(updateMetadataMock).not.toHaveBeenCalled();
        });

        it('can not submit if the form is invalid', async () => {
          await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

          const isoInput = screen.getByLabelText('ISO');
          const saveButton = screen.getByRole('button', { name: 'Save' });
          await userEvent.type(isoInput, '100');

          expect(isoInput).toBeValid();
          await waitFor(() => expect(saveButton).toBeEnabled());

          await userEvent.type(isoInput, 'nope');

          expect(isoInput).toBeInvalid();
          await waitFor(() => expect(saveButton).toBeDisabled());
        });

        describe('when failed to save an image', () => {
          beforeEach(() => {
            vi.stubGlobal('console', { error: () => {} });
          });

          it('reports the error and re-enables the form', async () => {
            updateMetadataMock.mockRejectedValueOnce(new Error('No'));

            const errorHandler = vi.fn();
            await listen(ERROR_REPORTED_EVENT, (event) =>
              errorHandler(event.payload),
            );

            await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

            const artistInput = screen.getByLabelText('Artist');
            await userEvent.type(artistInput, 'T');
            await userEvent.click(screen.getByRole('button', { name: 'Save' }));

            await waitFor(() =>
              expect(errorHandler).toHaveBeenCalledExactlyOnceWith({
                message: 'Failed to save images',
                detail: 'No',
              }),
            );
            expect(artistInput).toBeEnabled();
          });
        });
      });
    });
  });
});

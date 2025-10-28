import { readMetadata } from '@metadata-handler/read';
import { updateMetadata } from '@metadata-handler/update';
import type { ImageInfo } from '@platform/file-manager';
import { showToast } from '@screens/Toasts/toast-queue';
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
const showToastMock = showToast as unknown as Mock<typeof showToast>;

vi.mock('@tauri-apps/plugin-store', () => ({
  load: vi
    .fn<typeof load>()
    .mockResolvedValue(
      new Map() as unknown as Awaited<ReturnType<typeof load>>,
    ),
}));

vi.mock('@metadata-handler/read');
vi.mock('@metadata-handler/update');
vi.mock('@screens/Toasts/toast-queue');

vi.mock('react-map-gl/maplibre');

const Wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
);

const render = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  originalRender(ui, { wrapper: Wrapper, ...options });

describe('MetadataEditorPanel', () => {
  beforeEach(() => {
    mockIPC(() => { }, { shouldMockEvents: true });
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
        vi.stubGlobal('console', { error: () => { } });
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
        readMetadataMock.mockResolvedValueOnce({ Artist: 'test person' });
        render(<MetadataEditorPanel selectedImages={selectedImages} />);
        await waitFor(() =>
          expect(screen.queryByText('Loading Metadata...')).toBeNull(),
        );
      });

      it('has tabs for the inputs', async () => {
        const exifTab = screen.getByText('EXIF');
        const locationTab = screen.getByText('Location');

        expect(exifTab).toBeVisible();
        expect(locationTab).toBeVisible();

        expect(exifTab).toHaveRole('tab');
        expect(locationTab).toHaveRole('tab');

        const artistInput = screen.getByLabelText('Artist');
        // TODO: this might be better offloading to the reset test
        expect(artistInput).toHaveValue('test person');
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
        const artistInput = screen.getByLabelText('Artist');

        expect(artistInput).toBeDisabled();
        await userEvent.click(screen.getByRole('tab', { name: 'Location' }));

        const latInput = screen.getByLabelText('GPSLatitude');
        expect(latInput).toBeDisabled();

        await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

        expect(latInput).toBeEnabled();
        await userEvent.click(screen.getByRole('tab', { name: 'EXIF' }));
        expect(artistInput).toBeEnabled();
      });

      describe('when form changes are cancelled', () => {
        it('resets unsaved values', async () => {
          const artistInput = screen.getByLabelText(
            'Artist',
          ) as HTMLInputElement;
          const initialValue = artistInput.value;

          await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
          await userEvent.type(artistInput, 'diff');
          expect(artistInput).toHaveValue(`${initialValue}diff`);

          await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

          expect(artistInput).toBeDisabled();
          expect(artistInput).toHaveValue(initialValue);
        });
      });

      describe('form submission', () => {
        it('disables the form', async () => {
          await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

          const artistInput = screen.getByLabelText('Artist');
          expect(artistInput).toBeEnabled();

          await userEvent.type(artistInput, 'T');
          expect(showToastMock).not.toHaveBeenCalled();
          const saveButton = screen.getByRole('button', { name: 'Save' });
          expect(saveButton).toBeEnabled();
          await userEvent.click(saveButton);

          expect(screen.getByLabelText('Artist')).toBeDisabled();
          expect(showToastMock).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ level: 'success' }),
          );
        });

        // this has no properties to test against
        it.todo('has a saving indicator');

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

        it.todo('can not submit if the form is not dirty');

        it.skip('can not submit if the form is invalid', async () => {
          await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

          const isoInput = screen.getByLabelText('ISO');
          const saveButton = screen.getByRole('button', { name: 'Save' });
          await userEvent.type(isoInput, '100'); // form needs to be edited for button to be enabled

          expect(isoInput).toBeValid();
          expect(saveButton).toBeEnabled();

          await userEvent.type(isoInput, 'nope');

          expect(isoInput).toBeInvalid();
          expect(saveButton).toBeDisabled();
        });

        describe('when failed to save an image', () => {
          it.todo('indicates when an image fails to save');

          it.todo('does something to the form value if partial success saving');
        });
      });
    });
  });
});

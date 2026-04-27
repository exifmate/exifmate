import { readMetadata } from '@metadata-handler/read';
import { IMAGES_OPENED_EVENT } from '@platform/file-manager';
import FileMenu, { REVEAL_IN_DIR_EVENT } from '@platform/menus/file-menu';
import { emit } from '@tauri-apps/api/event';
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import { mockIPC } from '@tauri-apps/api/mocks';
import type { load } from '@tauri-apps/plugin-store';
import {
  act,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SWRConfig } from 'swr';
import type { Mock } from 'vitest';
import Shell from '../Shell';

vi.mock('@platform/file-manager');
vi.mock('@tauri-apps/api/menu');
vi.mock('@tauri-apps/plugin-opener');
vi.mock('@metadata-handler/read');
vi.mock('@tauri-apps/plugin-store', () => ({
  load: vi.fn<typeof load>(() => new Promise(() => { })),
}));
vi.mock(import('@heroui/react'), async (importOriginal) => {
  const original = await importOriginal();
  original.toast.danger = vi.fn();
  original.toast.success = vi.fn();
  return original;
});

vi.stubGlobal('URL', {
  createObjectURL: vi.fn(),
});

const readMetadataMock = readMetadata as unknown as Mock<typeof readMetadata>;
const revealItemInDirMock = revealItemInDir as unknown as Mock<
  typeof revealItemInDir
>;

describe('Shell', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    Element.prototype.getAnimations = vi.fn().mockReturnValue([]);

    mockIPC(() => { }, { shouldMockEvents: true });
    readMetadataMock.mockImplementation(() => new Promise(() => { }));

    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <Shell />
      </SWRConfig>,
    );

    await act(async () => {
      await emit(IMAGES_OPENED_EVENT, {
        images: [
          {
            filename: 'image-one.jpg',
            path: '/image-one.jpg',
          },
          {
            filename: 'image-two.jpg',
            path: '/image-two.jpg',
          },
        ],
      });
    });
  });

  it('has a resizable panel for images and metadata editor', () => {
    expect(screen.getByRole('separator')).toBeVisible();
  });

  it('can select an image', async () => {
    expect(screen.getByText('No Image Selected')).toBeVisible();
    expect(screen.queryByText('Loading Metadata...')).toBeNull();
    expect(screen.queryByLabelText('Artist')).toBeNull();

    const imageItem = screen.getByLabelText('image-one.jpg');
    expect(imageItem).toBeVisible();
    await userEvent.click(imageItem);

    expect(screen.queryByText('No Image Selected')).toBeNull();
    expect(screen.getByText('Loading Metadata...')).toBeVisible();
  });

  it('handles the reveal in dir event', async () => {
    await userEvent.click(screen.getByLabelText('image-one.jpg'));

    await act(async () => {
      await emit(REVEAL_IN_DIR_EVENT);
    });

    await waitFor(() =>
      expect(revealItemInDirMock).toHaveBeenCalledWith('/image-one.jpg'),
    );
  });

  describe('when selected image is changed', () => {
    beforeEach(async () => {
      readMetadataMock.mockResolvedValueOnce({ Artist: 'Tegan' });
      await userEvent.click(screen.getByLabelText('image-one.jpg'));
      await screen.findByRole('tab', { name: 'EXIF' });
    });

    it('persists the opened tab between image selection changing', async () => {
      expect(await screen.findByLabelText('Artist')).toBeVisible();
      expect(screen.queryByLabelText('GPSLatitude')).toBeNull();

      await userEvent.click(screen.getByRole('tab', { name: 'Location' }));

      expect(screen.getByLabelText('GPSLatitude')).toBeVisible();
      expect(screen.queryByLabelText('Artist')).toBeNull();

      readMetadataMock.mockResolvedValueOnce({});
      await userEvent.click(screen.getByLabelText('image-two.jpg'));
      await screen.findByRole('tab', { name: 'EXIF' });

      expect(screen.queryByLabelText('Artist')).toBeNull();
      expect(screen.getByLabelText('GPSLatitude')).toBeVisible();
    });

    it('disables the form', async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
      expect(screen.getByLabelText('Artist')).toBeEnabled();

      readMetadataMock.mockResolvedValueOnce({});
      await userEvent.click(screen.getByLabelText('image-two.jpg'));
      await screen.findByRole('tab', { name: 'EXIF' });
      expect(screen.getByLabelText('Artist')).toBeDisabled();
    });

    it('blanks out inputs for fields that now have no value', async () => {
      readMetadataMock.mockResolvedValueOnce({
        Artist: 'Test Person',
        DateTimeOriginal: '2025-01-01T12:00:00',
        Flash: 'Fired',
      });
      await userEvent.click(screen.getByLabelText('image-two.jpg'));
      await screen.findByRole('tab', { name: 'EXIF' });

      expect(screen.getByLabelText('Artist')).toHaveValue('Test Person');
      expect(screen.getByLabelText('Flash')).toHaveTextContent('Fired');
      const populatedDateGroup = screen.getByRole('group', {
        name: 'DateTimeOriginal',
      });
      const populatedYearSegment = within(populatedDateGroup).getByLabelText('year,');
      expect(populatedYearSegment).toHaveTextContent('2025');
      expect(populatedYearSegment).not.toHaveAttribute('data-placeholder');

      readMetadataMock.mockResolvedValueOnce({});
      await userEvent.click(screen.getByLabelText('image-one.jpg'));
      await screen.findByRole('tab', { name: 'EXIF' });

      expect(screen.getByLabelText('Artist')).toHaveValue('');

      const flashTrigger = screen.getByLabelText('Flash');
      expect(flashTrigger).not.toHaveTextContent('Fired');
      expect(
        flashTrigger.querySelector('[data-slot="select-value"]'),
      ).toHaveAttribute('data-placeholder', 'true');

      const blankDateGroup = screen.getByRole('group', {
        name: 'DateTimeOriginal',
      });
      for (const name of ['year,', 'month,', 'day,', 'hour,', 'minute,', 'second,']) {
        const segment = within(blankDateGroup).getByLabelText(name);
        expect(segment).toHaveAttribute('data-placeholder', 'true');
        expect(segment).toHaveAttribute('aria-valuetext', 'Empty');
      }
    });

    it('enables the reveal in dir menu item', async () => {
      const item = await FileMenu.get('reveal-in-dir');
      expect(item.setEnabled).toHaveBeenLastCalledWith(true);

      await userEvent.keyboard('{Meta>}');
      await userEvent.click(screen.getByLabelText('image-two.jpg'));
      await userEvent.keyboard('{/Meta}');

      await waitFor(() =>
        expect(item.setEnabled).toHaveBeenLastCalledWith(false),
      );
    });
  });
});

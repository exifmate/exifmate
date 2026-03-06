import { IMAGES_OPENED_EVENT } from '@platform/file-manager';
import { emit } from '@tauri-apps/api/event';
import { mockIPC } from '@tauri-apps/api/mocks';
import type { load } from '@tauri-apps/plugin-store';
import {
  act,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fs } from 'memfs';
import { ImageOne, ImageTwo } from 'test-support/fake-images';
import Shell from '../Shell';

vi.mock('@platform/file-manager');
vi.mock('@tauri-apps/api/menu');
vi.mock('@tauri-apps/plugin-fs');
vi.mock('@tauri-apps/plugin-store', () => ({
  load: vi.fn<typeof load>(() => new Promise(() => {})),
}));

vi.stubGlobal('URL', {
  createObjectURL: vi.fn(),
});

describe('Shell', () => {
  beforeEach(async () => {
    mockIPC(() => {}, { shouldMockEvents: true });

    await Promise.all([
      fs.promises.writeFile('/image-one.jpg', ImageOne),
      fs.promises.writeFile('/image-two.jpg', ImageTwo),
    ]);

    render(<Shell />);

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

  it.todo('has a resizable panel for images and metadata editor');

  it('can select an image', async () => {
    expect(screen.getByText('No Image Selected')).toBeVisible();
    expect(screen.queryByText('Loading Metadata...')).toBeNull();
    expect(screen.queryByLabelText('Artist')).toBeNull();

    const imageItem = screen.getByLabelText('image-one.jpg');
    expect(imageItem).toBeVisible();
    await userEvent.click(imageItem);

    expect(screen.queryByText('No Image Selected')).toBeNull();
    expect(screen.getByText('Loading Metadata...')).toBeVisible();
    // expect(await screen.findByLabelText('Artist')).toBeVisible();
  });

  it.todo('handles the reveal in dir event');

  describe.skip('when selected image is changed', () => {
    beforeEach(async () => {
      await userEvent.click(screen.getByLabelText('image-one.jpg'));
      await waitForElementToBeRemoved(screen.getByText('Loading Metadata...'));
    });

    it('persists the opened tab between image selection changing', async () => {
      expect(await screen.findByLabelText('Artist')).toBeVisible();
      expect(screen.queryByLabelText('GPSLatitude')).toBeNull();

      await userEvent.click(screen.getByRole('tab', { name: 'Location' }));

      expect(screen.getByLabelText('GPSLatitude')).toBeVisible();
      expect(screen.queryByLabelText('Artist')).toBeNull();

      await userEvent.click(screen.getByLabelText('image-two.jpg'));
      await waitForElementToBeRemoved(screen.getByText('Loading Metadata...'));

      expect(screen.queryByLabelText('Artist')).toBeNull();
      expect(screen.getByLabelText('GPSLatitude')).toBeVisible();
    });

    it('disables the form', async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
      expect(screen.getByLabelText('Artist')).toBeEnabled();

      await userEvent.click(screen.getByLabelText('image-two.jpg'));
      await waitForElementToBeRemoved(screen.getByText('Loading Metadata...'));
      expect(screen.getByLabelText('Artist')).toBeDisabled();
    });

    it.todo('blanks out inputs for fields that now have no value');

    it.todo('enables the reveal in dir menu item');
  });
});

import { User } from '@react-aria/test-utils';
import type { load } from '@tauri-apps/plugin-store';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fs } from 'memfs';
import { ImageOne, ImageTwo } from '../../core/__specs__/fake-images';
import type { onImagesOpened } from '../../core/events';
import { ImageProvider } from '../../ImageContext';
import Shell from '../Shell';

vi.mock('@tauri-apps/plugin-fs');
vi.mock('@tauri-apps/plugin-store', () => ({
  load: vi.fn<typeof load>(() => new Promise(() => {})),
}));

vi.stubGlobal('URL', {
  createObjectURL: vi.fn(),
});

vi.mock(import('../../core/events'), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    onImagesOpened: vi.fn<typeof onImagesOpened>((cb) => {
      cb([
        {
          filename: 'image-one.jpg',
          path: '/image-one.jpg',
        },
        {
          filename: 'image-two.jpg',
          path: '/image-two.jpg',
        },
      ]);
      return Promise.resolve(() => {});
    }),
  };
});

const selectRow = async (rowText: string) => {
  const testUtilUser = new User({
    interactionType: 'mouse',
    advanceTimer: vi.advanceTimersByTime,
  });
  const gridListTester = testUtilUser.createTester('GridList', {
    root: screen.getByTestId('test-gridlist'),
    interactionType: 'keyboard',
  });

  const row = gridListTester.findRow({ rowIndexOrText: rowText });
  await gridListTester.toggleRowSelection({ row });
};

describe('Shell', () => {
  beforeEach(async () => {
    await Promise.all([
      fs.promises.writeFile('/image-one.jpg', ImageOne),
      fs.promises.writeFile('/image-two.jpg', ImageTwo),
    ]);

    render(
      <ImageProvider>
        <Shell />
      </ImageProvider>,
    );
    expect(await screen.findByAltText('image-one.jpg thumbnail')).toBeVisible();
  });

  it.todo('has a resizable panel for images and metadata editor');

  it('can select an image', async () => {
    expect(screen.getByText('No Image Selected')).toBeVisible();
    expect(screen.queryByLabelText('Artist')).toBeNull();
    await selectRow('image-one.jpg');
    expect(await screen.findByLabelText('Artist')).toBeVisible();
  });

  describe('when selected image is changed', () => {
    beforeEach(async () => {
      await selectRow('image-one.jpg');
      await waitForElementToBeRemoved(screen.getByText('Loading Metadata...'));
    });

    it('persists the opened tab between image selection changing', async () => {
      expect(screen.getByLabelText('Artist')).toBeVisible();
      expect(screen.getByLabelText('GPSLatitude')).not.toBeVisible();

      await userEvent.click(screen.getByText('Location'));
      expect(screen.getByLabelText('Artist')).not.toBeVisible();
      expect(screen.getByLabelText('GPSLatitude')).toBeVisible();

      await selectRow('image-two.jpg');
      await waitForElementToBeRemoved(screen.getByText('Loading Metadata...'));

      expect(screen.getByLabelText('Artist')).not.toBeVisible();
      expect(screen.getByLabelText('GPSLatitude')).toBeVisible();
    });

    it('disables the form', async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
      expect(screen.getByLabelText('Artist')).toBeEnabled();

      await selectRow('image-two.jpg');
      await waitForElementToBeRemoved(screen.getByText('Loading Metadata...'));
      expect(screen.getByLabelText('Artist')).toBeDisabled();
    });

    it.todo('blanks out inputs for fields that now have no value');
  });
});

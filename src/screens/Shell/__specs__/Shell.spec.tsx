import { User } from '@react-aria/test-utils';
import type { load } from '@tauri-apps/plugin-store';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Shell from '../Shell';

vi.mock('@tauri-apps/plugin-fs');
vi.mock('@tauri-apps/plugin-store', () => ({
  load: vi.fn<typeof load>(() => new Promise(() => {})),
}));

vi.stubGlobal('URL', {
  createObjectURL: vi.fn(),
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
    render(<Shell />);
    expect(await screen.findByAltText('image-one.jpg thumbnail')).toBeVisible();
  });

  it.todo('has a resizable panel for images and metadata editor');

  it.skip('can select an image', async () => {
    expect(screen.getByText('No Image Selected')).toBeVisible();
    expect(screen.queryByLabelText('Artist')).toBeNull();
    await selectRow('image-one.jpg');
    expect(await screen.findByLabelText('Artist')).toBeVisible();
  });

  describe.skip('when selected image is changed', () => {
    beforeEach(async () => {
      await selectRow('image-one.jpg');
      await waitForElementToBeRemoved(screen.getByText('Loading Metadata...'));
    });

    it('persists the opened tab between image selection changing', async () => {
      const testUtilUser = new User({
        interactionType: 'mouse',
        advanceTimer: vi.advanceTimersByTime,
      });
      const tabTester = testUtilUser.createTester('Tabs', {
        root: screen.getByLabelText('Editor Tabs'),
        interactionType: 'keyboard',
      });

      expect(await screen.findByLabelText('Artist')).toBeVisible();
      expect(screen.queryByLabelText('GPSLatitude')).toBeNull();

      await tabTester.triggerTab({ tab: 'Location' });

      expect(screen.getByLabelText('GPSLatitude')).toBeVisible();
      expect(screen.queryByLabelText('Artist')).toBeNull();

      await selectRow('image-two.jpg');
      await waitForElementToBeRemoved(screen.getByText('Loading Metadata...'));

      expect(screen.queryByLabelText('Artist')).toBeNull();
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

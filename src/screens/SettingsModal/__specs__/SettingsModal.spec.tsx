import { loadSettings, type Settings, saveSettings } from '@platform/settings';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import SettingsModal from '../SettingsModal';

// const mockOnOpenSettings = onOpenSettings as unknown as Mock<typeof onOpenSettings>;
// vi.mock('@app/platform/app-menu');

vi.mock('@tauri-apps/api/event');
vi.mock('@platform/app-menu', () => ({
  onOpenSettings: vi.fn((cb) => {
    cb();
    return Promise.resolve();
  }),
}));

const mockLoadSettings = loadSettings as unknown as Mock<typeof loadSettings>;
const mockSaveSettings = saveSettings as unknown as Mock<typeof saveSettings>;
vi.mock(import('@platform/settings'), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    loadSettings: vi.fn(),
    saveSettings: vi.fn(),
  };
});

describe('SettingsModal', () => {
  beforeEach(() => {
    const fakeSettings: Settings = {
      originalFileBehavior: 'overwrite_original_in_place',
    };
    mockLoadSettings.mockResolvedValueOnce(fakeSettings);
  });

  it('has a form for settings', async () => {
    render(<SettingsModal />);
    expect(await screen.findByText('Settings')).toBeVisible();
    expect(
      screen.getByLabelText(/Overwrite Original File In Place/),
    ).toBeChecked();

    await userEvent.click(screen.getByLabelText(/Copy Original File/));
    expect(mockSaveSettings).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(mockSaveSettings).toHaveBeenCalledExactlyOnceWith({
      originalFileBehavior: 'copy_original',
    });
    // await waitFor(() => expect(screen.queryByText('Settings')).toBeNull());
    // TODO: assert toast shown
  });

  it.todo('shows an alert if the settings fail to load');

  it.todo('shows an alert if the settings fail to save');

  it.todo('can open from an event');
});

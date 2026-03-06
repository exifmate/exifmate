import { OPEN_SETTINGS_EVENT } from '@platform/menus/app-menu';
import { loadSettings, type Settings, saveSettings } from '@platform/settings';
import { emit } from '@tauri-apps/api/event';
import { mockIPC } from '@tauri-apps/api/mocks';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import SettingsModal from '../SettingsModal';

vi.mock('@tauri-apps/api/menu');

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
    mockIPC(() => {}, { shouldMockEvents: true });

    const fakeSettings: Settings = {
      originalFileBehavior: 'overwrite_original_in_place',
    };
    mockLoadSettings.mockResolvedValueOnce(fakeSettings);
  });

  it('has a form for settings', async () => {
    render(<SettingsModal />);
    await act(async () => {
      await emit(OPEN_SETTINGS_EVENT);
    });

    await waitFor(() => expect(screen.getByText('Settings')).toBeVisible());
    expect(
      screen.getByLabelText(/Overwrite Original File In Place/),
    ).toBeChecked();

    await userEvent.click(
      screen.getByLabelText(/Copy Original File \(default\)/),
    );
    expect(mockSaveSettings).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(mockSaveSettings).toHaveBeenCalledExactlyOnceWith({
      originalFileBehavior: 'copy_original',
    });
    await waitFor(() => expect(screen.queryByText('Settings')).toBeNull());
    // TODO: assert toast shown
  });

  it.todo('shows an alert if the settings fail to load');

  it.todo('shows an alert if the settings fail to save');

  it.todo('can open from an event');
});

import { toast } from '@heroui/react';
import { OPEN_SETTINGS_EVENT } from '@platform/menus/app-menu';
import { loadSettings, type Settings, saveSettings } from '@platform/settings';
import { emit } from '@tauri-apps/api/event';
import { mockIPC } from '@tauri-apps/api/mocks';
import {
  act,
  render as originalRender,
  type RenderOptions,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { SWRConfig } from 'swr';
import type { Mock } from 'vitest';
import SettingsModal from '../SettingsModal';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
);

const render = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  originalRender(ui, { wrapper: Wrapper, ...options });

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

vi.mock(import('@heroui/react'), async (importOriginal) => {
  const original = await importOriginal();
  original.toast.danger = vi.fn();
  original.toast.success = vi.fn();
  return original;
});

const toastMock = toast as unknown as Mock<typeof toast>;

describe('SettingsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIPC(() => {}, { shouldMockEvents: true });

    const fakeSettings: Settings = {
      originalFileBehavior: 'overwrite_original_in_place',
    };
    mockLoadSettings.mockResolvedValue(fakeSettings);
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
    expect(toastMock.success).toHaveBeenCalledExactlyOnceWith(
      'Settings Saved',
      {
        timeout: 3_000,
      },
    );
    expect(toastMock.danger).not.toHaveBeenCalled();
  });

  it('shows an alert if the settings fail to load', async () => {
    vi.stubGlobal('console', { error: () => {} });
    mockLoadSettings.mockReset();
    mockLoadSettings.mockRejectedValue(new Error('boom'));

    render(<SettingsModal />);
    await act(async () => {
      await emit(OPEN_SETTINGS_EVENT);
    });

    await waitFor(() =>
      expect(toastMock.danger).toHaveBeenCalledWith('Failed to load settings'),
    );
  });

  it('shows an alert if the settings fail to save', async () => {
    vi.stubGlobal('console', { error: () => {} });
    mockSaveSettings.mockRejectedValueOnce(new Error('boom'));

    render(<SettingsModal />);
    await act(async () => {
      await emit(OPEN_SETTINGS_EVENT);
    });
    await waitFor(() => expect(screen.getByText('Settings')).toBeVisible());

    await userEvent.click(
      screen.getByLabelText(/Copy Original File \(default\)/),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(toastMock.danger).toHaveBeenCalledExactlyOnceWith(
        'Failed to save settings',
      ),
    );
    expect(screen.getByText('Settings')).toBeVisible();
  });

  it('closes when Cancel is pressed', async () => {
    render(<SettingsModal />);
    await act(async () => {
      await emit(OPEN_SETTINGS_EVENT);
    });
    await waitFor(() => expect(screen.getByText('Settings')).toBeVisible());

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByText('Settings')).toBeNull());
    expect(mockSaveSettings).not.toHaveBeenCalled();
  });
});

import { exiftoolVersion, perlVersion } from '@metadata-handler/exiftool';
import { OPEN_ABOUT_EVENT } from '@platform/menus/app-menu';
import { getVersion } from '@tauri-apps/api/app';
import { emit } from '@tauri-apps/api/event';
import { mockIPC } from '@tauri-apps/api/mocks';
import { act, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import type { Mock } from 'vitest';
import AboutModal from '../AboutModal';

vi.mock('@tauri-apps/api/menu');
vi.mock('@tauri-apps/api/app');
vi.mock('@metadata-handler/exiftool');

const getVersionMock = getVersion as unknown as Mock<typeof getVersion>;
const exiftoolVersionMock = exiftoolVersion as unknown as Mock<
  typeof exiftoolVersion
>;
const perlVersionMock = perlVersion as unknown as Mock<typeof perlVersion>;

const Wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
);

interface StateCase {
  name: 'loading' | 'good' | 'error';
  setup: () => void;
  assert: () => Promise<void>;
}

const cases: StateCase[] = [
  {
    name: 'loading',
    setup: () => {
      getVersionMock.mockImplementation(() => new Promise(() => {}));
      exiftoolVersionMock.mockImplementation(() => new Promise(() => {}));
      perlVersionMock.mockImplementation(() => new Promise(() => {}));
    },
    assert: async () => {
      expect(screen.getByText('ExifMate Version:')).toBeVisible();
      expect(screen.getByText('ExifTool Version')).toBeVisible();
      expect(screen.getByText('Perl Version')).toBeVisible();
      expect(screen.queryByText('test-app-version')).toBeNull();
      expect(screen.queryByText('test-exiftool-version')).toBeNull();
      expect(screen.queryByText('test-perl-version')).toBeNull();
      expect(screen.queryByText('Error Loading')).toBeNull();
    },
  },
  {
    name: 'good',
    setup: () => {
      getVersionMock.mockResolvedValue('test-app-version');
      exiftoolVersionMock.mockResolvedValue('test-exiftool-version');
      perlVersionMock.mockResolvedValue('test-perl-version');
    },
    assert: async () => {
      expect(await screen.findByText('test-app-version')).toBeVisible();
      expect(screen.getByText('test-exiftool-version')).toBeVisible();
      expect(screen.getByText('test-perl-version')).toBeVisible();
      expect(screen.queryByText('Error Loading')).toBeNull();
    },
  },
  {
    name: 'error',
    setup: () => {
      vi.stubGlobal('console', { error: vi.fn() });
      getVersionMock.mockRejectedValue(new Error('app failed'));
      exiftoolVersionMock.mockRejectedValue(new Error('exiftool failed'));
      perlVersionMock.mockRejectedValue(new Error('perl failed'));
    },
    assert: async () => {
      const errors = await screen.findAllByText('Error Loading');
      expect(errors).toHaveLength(3);
      expect(screen.queryByText('test-app-version')).toBeNull();
    },
  },
];

describe('AboutModal', () => {
  beforeEach(() => {
    mockIPC(() => {}, { shouldMockEvents: true });
  });

  test.each(cases)('shows the $name state for all version fetchers', async ({
    setup,
    assert,
  }) => {
    setup();

    render(<AboutModal />, { wrapper: Wrapper });

    expect(screen.queryByText('About ExifMate')).toBeNull();
    await act(async () => {
      await emit(OPEN_ABOUT_EVENT);
    });
    await screen.findByText('About ExifMate');

    await assert();
  });
});

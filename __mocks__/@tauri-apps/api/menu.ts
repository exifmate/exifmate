import { vi } from 'vitest';

vi.mock('@tauri-apps/plugin-os');

const mockMenuItem = () =>
  Promise.resolve({
    setEnabled: vi.fn(() => Promise.resolve()),
    get: vi.fn(mockMenuItem),
    setText: vi.fn(),
  });

export const Submenu = {
  new: vi.fn(mockMenuItem),
};
export const PredefinedMenuItem = {
  new: vi.fn(),
};

export const MenuItem = {
  new: vi.fn(mockMenuItem),
};

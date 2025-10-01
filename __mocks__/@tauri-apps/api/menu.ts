import { vi } from 'vitest';

export const Menu = { new: vi.fn().mockReturnValue({ setAsAppMenu: vi.fn() }) };

export const MenuItem = {
  new: vi.fn().mockReturnValue({
    setEnabled: vi.fn(),
  }),
};

export const PredefinedMenuItem = { new: vi.fn() };

export const Submenu = { new: vi.fn().mockReturnValue({ setEnabled: vi.fn() }) };

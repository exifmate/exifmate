import { vi } from 'vitest';

vi.mock('@tauri-apps/plugin-os');

interface MockMenuItem {
  setEnabled: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  setText: ReturnType<typeof vi.fn>;
}

const itemsById = new Map<string, MockMenuItem>();

const makeItem = (): MockMenuItem => ({
  setEnabled: vi.fn(() => Promise.resolve()),
  get: vi.fn((id: string) => {
    if (!itemsById.has(id)) {
      itemsById.set(id, makeItem());
    }
    return Promise.resolve(itemsById.get(id));
  }),
  setText: vi.fn(),
});

export const Submenu = {
  new: vi.fn(() => Promise.resolve(makeItem())),
};

export const PredefinedMenuItem = {
  new: vi.fn(),
};

export const MenuItem = {
  new: vi.fn(() => Promise.resolve(makeItem())),
};

import '@testing-library/jest-dom/vitest';
import nodeFs from 'node:fs/promises';
import { vi } from 'vitest';

const { getComputedStyle } = window;
window.getComputedStyle = (elt) => getComputedStyle(elt);
window.HTMLElement.prototype.scrollIntoView = () => {};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

vi.stubGlobal('fetch', async (url: string) => {
  if (url.includes('zeroperl-1.0.0.wasm')) {
    const zeroperl = await nodeFs.readFile('./vendor/zeroperl-1.0.0.wasm');
    if (zeroperl instanceof Buffer) {
      return new Response(new Uint8Array(zeroperl), {
        headers: { 'Content-Type': 'application/wasm' },
      });
    }
  }

  throw `Unhandled url called: ${url}`;
});

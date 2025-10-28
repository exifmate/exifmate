import { emit } from '@tauri-apps/api/event';
import { mockIPC } from '@tauri-apps/api/mocks';
import { renderHook } from '@testing-library/react';
import useTauriListener from '../useTauriListener';

describe('useTauriListener', () => {
  beforeEach(() => {
    mockIPC(() => {}, { shouldMockEvents: true });
  });

  it('creates a listener for responding to Tauri events', async () => {
    const testCallback = vi.fn();
    renderHook(() => useTauriListener('test', testCallback));

    await emit('test', 'i am the payload');
    expect(testCallback).toHaveBeenCalledExactlyOnceWith('i am the payload');
  });
});

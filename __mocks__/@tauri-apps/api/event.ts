import { vi } from 'vitest';

export const listen = vi.fn().mockResolvedValue(null);
export const emit = vi.fn();

import {
  ERROR_REPORTED_EVENT,
  type ErrorReport,
  reportError,
} from '@platform/error-reporter';
import { listen } from '@tauri-apps/api/event';
import { mockIPC } from '@tauri-apps/api/mocks';
import { waitFor } from '@testing-library/react';

describe('reportError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIPC(() => {}, { shouldMockEvents: true });
    vi.stubGlobal('console', { error: vi.fn() });
  });

  async function captureNextReport(): Promise<ErrorReport> {
    return new Promise<ErrorReport>((resolve) => {
      void listen<ErrorReport>(ERROR_REPORTED_EVENT, (event) => {
        resolve(event.payload);
      });
    });
  }

  it('emits the event with the Error message as detail', async () => {
    const reportPromise = captureNextReport();
    reportError('Something failed', new Error('boom'));
    await expect(reportPromise).resolves.toEqual({
      message: 'Something failed',
      detail: 'boom',
    });
  });

  it('uses a string error directly as detail', async () => {
    const reportPromise = captureNextReport();
    reportError('Something failed', 'raw stderr text');
    await expect(reportPromise).resolves.toEqual({
      message: 'Something failed',
      detail: 'raw stderr text',
    });
  });

  it('emits empty detail for null', async () => {
    const reportPromise = captureNextReport();
    reportError('Something failed', null);
    await expect(reportPromise).resolves.toEqual({
      message: 'Something failed',
      detail: '',
    });
  });

  it('emits empty detail for undefined', async () => {
    const reportPromise = captureNextReport();
    reportError('Something failed', undefined);
    await expect(reportPromise).resolves.toEqual({
      message: 'Something failed',
      detail: '',
    });
  });

  it('falls back to String() for non-Error, non-string values', async () => {
    const reportPromise = captureNextReport();
    reportError('Something failed', { weird: true });
    await expect(reportPromise).resolves.toEqual({
      message: 'Something failed',
      detail: '[object Object]',
    });
  });

  it('logs the error via console.error', async () => {
    const err = new Error('boom');
    reportError('Something failed', err);
    await waitFor(() =>
      expect(console.error).toHaveBeenCalledWith('Something failed:', err),
    );
  });
});

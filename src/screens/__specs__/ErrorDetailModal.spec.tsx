import { ToastProvider, toast } from '@heroui/react';
import {
  ERROR_REPORTED_EVENT,
  type ErrorReport,
} from '@platform/error-reporter';
import { emit } from '@tauri-apps/api/event';
import { mockIPC } from '@tauri-apps/api/mocks';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorDetailModal from '../ErrorDetailModal';

function renderModal() {
  render(
    <>
      <ToastProvider />
      <ErrorDetailModal />
    </>,
  );
}

async function emitReport(report: ErrorReport) {
  await act(async () => {
    await emit(ERROR_REPORTED_EVENT, report);
  });
}

describe('ErrorDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIPC(() => {}, { shouldMockEvents: true });
  });

  afterEach(async () => {
    await act(async () => {
      toast.clear();
    });
  });

  it('shows a danger toast with a Details button when detail is non-empty', async () => {
    renderModal();
    await emitReport({
      message: 'Failed adding images',
      detail: 'exiftool says no',
    });

    expect(await screen.findByText('Failed adding images')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Details' })).toBeVisible();
  });

  it('opens a modal with the detail when Details is clicked', async () => {
    renderModal();
    await emitReport({
      message: 'Failed adding images',
      detail: 'exiftool says no',
    });

    await userEvent.click(
      await screen.findByRole('button', { name: 'Details' }),
    );

    expect(screen.getByText('Error Details')).toBeVisible();
    expect(screen.getByText('exiftool says no')).toBeVisible();
  });

  it('renders no Details button when detail is empty', async () => {
    renderModal();
    await emitReport({
      message: 'Failed adding images',
      detail: '',
    });

    expect(await screen.findByText('Failed adding images')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Details' })).toBeNull();
  });

  it('closes the modal via the close trigger', async () => {
    renderModal();
    await emitReport({
      message: 'Failed adding images',
      detail: 'exiftool says no',
    });

    await userEvent.click(
      await screen.findByRole('button', { name: 'Details' }),
    );
    expect(screen.getByText('Error Details')).toBeVisible();

    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }),
    );

    await waitFor(() => expect(screen.queryByText('Error Details')).toBeNull());
  });

  it('preserves each toast detail in its own closure when multiple errors arrive', async () => {
    renderModal();
    await emitReport({ message: 'First error', detail: 'first detail' });
    await emitReport({ message: 'Second error', detail: 'second detail' });

    const detailsButtons = await screen.findAllByRole('button', {
      name: 'Details',
    });
    expect(detailsButtons.length).toBeGreaterThanOrEqual(2);

    // The most recently rendered toast appears first in the queue.
    // Click the older toast's Details button (last in the array).
    await userEvent.click(detailsButtons[detailsButtons.length - 1]);

    expect(screen.getByText('first detail')).toBeVisible();
  });
});

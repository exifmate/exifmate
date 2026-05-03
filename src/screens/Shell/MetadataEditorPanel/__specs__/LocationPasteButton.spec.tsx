import { zodResolver } from '@hookform/resolvers/zod';
import { defaultExifData, ExifData } from '@metadata-handler/exifdata';
import { readText } from '@tauri-apps/plugin-clipboard-manager';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import LocationPasteButton from '../LocationPasteButton';
import TextInput from '../TextInput';

vi.mock('@tauri-apps/plugin-clipboard-manager');

vi.mock(import('@heroui/react'), async (importOriginal) => {
  const original = await importOriginal();

  function TooltipMock({ children }: { children: ReactNode }) {
    return <>{children}</>;
  }
  TooltipMock.Content = ({ children }: { children: ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  );

  return {
    ...original,
    Tooltip: TooltipMock as unknown as typeof original.Tooltip,
  };
});

function DirtyProbe() {
  const {
    formState: { isDirty },
  } = useFormContext<ExifData>();
  return <output>isDirty={String(isDirty)}</output>;
}

function TestContainer() {
  const form = useForm({
    resolver: zodResolver(ExifData),
    mode: 'onChange',
    defaultValues: defaultExifData,
  });
  return (
    <FormProvider {...form}>
      <DirtyProbe />
      <TextInput tagName="GPSLatitude" />
      <TextInput tagName="GPSLongitude" />
      <LocationPasteButton />
    </FormProvider>
  );
}

describe('LocationPasteButton', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('parses lat/lon from the clipboard and sets form values', async () => {
    vi.mocked(readText).mockResolvedValueOnce('40.7128°, -74.006°');
    render(<TestContainer />);

    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByLabelText('GPSLatitude')).toHaveValue('40.7128');
    });
    expect(screen.getByLabelText('GPSLongitude')).toHaveValue('-74.006');
  });

  it('dirties the form and triggers validation', async () => {
    vi.mocked(readText).mockResolvedValueOnce('999, 0');
    render(<TestContainer />);

    expect(screen.getByText('isDirty=false')).toBeVisible();
    expect(screen.queryByText(/Too big|expected/i)).toBeNull();

    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(screen.getByText('isDirty=true')).toBeVisible());
    expect(screen.getByText(/Too big/i)).toBeVisible();
  });

  it('shows, changes, then resets the tooltip label after the success window', async () => {
    vi.mocked(readText).mockResolvedValueOnce('1, 2');
    vi.useFakeTimers();

    render(<TestContainer />);

    expect(screen.getByTestId('tooltip-content')).toHaveTextContent(
      'Paste Location',
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByTestId('tooltip-content')).toHaveTextContent(
      'Location Pasted!',
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });
    expect(screen.getByTestId('tooltip-content')).toHaveTextContent(
      'Paste Location',
    );
  });
});

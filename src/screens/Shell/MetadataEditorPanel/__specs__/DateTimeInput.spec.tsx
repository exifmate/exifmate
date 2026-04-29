import { zodResolver } from '@hookform/resolvers/zod';
import { ExifData } from '@metadata-handler/exifdata';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import DateTimeInput from '../DateTimeInput';

type TestContainerProps = Parameters<typeof DateTimeInput>[0] & {
  cb?: (v: unknown) => void;
};

function TestContainer({ cb, tagName, ...props }: TestContainerProps) {
  const form = useForm({
    resolver: zodResolver(ExifData),
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((val) => cb?.(val))}>
        <DateTimeInput tagName={tagName} {...props} />
        <button type="submit">Go</button>
      </form>
    </FormProvider>
  );
}

describe('DateTimeInput', () => {
  it('can be a date input with seconds', async () => {
    const cb = vi.fn();
    render(<TestContainer tagName="DateTimeOriginal" cb={cb} />);

    const dateField = screen.getByRole('group', { name: 'DateTimeOriginal' });
    expect(dateField).toBeVisible();

    await userEvent.type(within(dateField).getByLabelText('month,'), '7');
    await userEvent.type(within(dateField).getByLabelText('day,'), '15', {
      skipClick: true,
    });
    await userEvent.type(within(dateField).getByLabelText('year,'), '2025', {
      skipClick: true,
    });
    await userEvent.type(within(dateField).getByLabelText('hour,'), '12', {
      skipClick: true,
    });
    await userEvent.type(within(dateField).getByLabelText('minute,'), '30', {
      skipClick: true,
    });
    await userEvent.type(within(dateField).getByLabelText('second,'), '10', {
      skipClick: true,
    });
    await userEvent.type(within(dateField).getByLabelText('AM/PM,'), 'p', {
      skipClick: true,
    });

    await userEvent.click(screen.getByText('Go'));
    expect(cb).toHaveBeenCalledExactlyOnceWith({
      DateTimeOriginal: '2025-07-15T12:30:10',
    });
  });
});

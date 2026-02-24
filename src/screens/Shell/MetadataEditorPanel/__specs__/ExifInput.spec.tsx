import { zodResolver } from '@hookform/resolvers/zod';
import { ExifData, FLASH_OPTIONS } from '@metadata-handler/exifdata';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import ExifInput from '../ExifInput';

type TestContainerProps = Parameters<typeof ExifInput>[0] & {
  cb?: (v: unknown) => void;
};

function TestContainer({ cb, tagName, ...props }: TestContainerProps) {
  const form = useForm({
    resolver: zodResolver(ExifData),
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((val) => cb?.(val))}>
        <ExifInput tagName={tagName} {...props} />
        <button type="submit">Go</button>
      </form>
    </FormProvider>
  );
}

describe('ExifInput', () => {
  it('defaults to a text input', async () => {
    const cb = vi.fn();
    render(<TestContainer tagName="Artist" cb={cb} />);
    const input = screen.getByLabelText('Artist');

    expect(input).toBeVisible();
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect((input as HTMLInputElement).type).toEqual('text');
    expect(input).not.toHaveAttribute('step');

    await userEvent.type(input, 'Test Artist');
    await userEvent.click(screen.getByText('Go'));

    expect(cb).toHaveBeenCalledExactlyOnceWith({ Artist: 'Test Artist' });
  });

  it('can show a desription', () => {
    render(
      <TestContainer
        tagName="ExposureCompensation"
        description="Test Description"
      />,
    );

    expect(screen.getByLabelText('ExposureCompensation Test Description'));
    render(<TestContainer tagName="Artist" />);
    expect(screen.getByLabelText('Artist')).not.toHaveAccessibleDescription();
  });

  it('can be a select input', async () => {
    const cb = vi.fn();
    render(
      <TestContainer
        tagName="Flash"
        type="select"
        options={FLASH_OPTIONS}
        cb={cb}
      />,
    );

    const selectBtn = screen.getByLabelText('Flash');
    expect(selectBtn).toBeVisible();

    expect(screen.queryByRole('listbox')).toBeNull();
    await userEvent.click(selectBtn);
    const input = screen.getByRole('listbox');
    expect(input).toBeVisible();

    const options = within(input)
      .getAllByRole('option')
      .map((o) => o.textContent);
    expect(options).toEqual([''].concat(FLASH_OPTIONS));

    await userEvent.click(within(input).getByRole('option', { name: 'Fired' }));
    await userEvent.click(screen.getByText('Go'));
    expect(cb).toHaveBeenCalledExactlyOnceWith({ Flash: 'Fired' });
  });

  describe('when the input is a select', () => {
    it.todo('can show custom values');
  });

  it('can be a date input with seconds', async () => {
    const cb = vi.fn();
    render(
      <TestContainer
        tagName="DateTimeOriginal"
        type="datetime-local"
        cb={cb}
      />,
    );

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

  it.todo('is valid if the date is typed or selected');

  describe('when the input is invalid', () => {
    it('indicates to the user', async () => {
      render(<TestContainer tagName="MaxApertureValue" />);

      const input = screen.getByLabelText('MaxApertureValue');
      await userEvent.type(input, 'not a number');
      await userEvent.click(screen.getByText('Go'));

      expect(input).toBeInvalid();
      expect(
        screen.getByText('Invalid input: expected number, received NaN'),
      ).toBeVisible();
    });
  });
});

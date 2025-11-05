import { zodResolver } from '@hookform/resolvers/zod';
import { ExifData, FLASH_OPTIONS } from '@metadata-handler/exifdata';
import { fireEvent, render, screen } from '@testing-library/react';
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

    expect(screen.getByLabelText(/ExposureCompensation/)).toEqual(
      screen.getByLabelText(/Test Description/),
    );

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

    const input = screen.getByLabelText('Flash');
    expect(input).toBeVisible();
    expect(input).toBeInstanceOf(HTMLSelectElement);

    const inputOptions = (input as HTMLSelectElement).options;
    const values = Array.from(inputOptions).map((a) => a.value);
    expect(values).toEqual([''].concat(FLASH_OPTIONS));

    await userEvent.selectOptions(input, 'Fired');
    await userEvent.click(screen.getByText('Go'));
    expect(cb).toHaveBeenCalledExactlyOnceWith({ Flash: 'Fired' });
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

    const input = screen.getByLabelText('DateTimeOriginal');
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect((input as HTMLInputElement).type).toEqual('datetime-local');
    expect(input).toHaveAttribute('step', '1');

    // datetime-local doesn't (currently) work with userEvent.type
    fireEvent.change(input, { target: { value: '2025-07-15 12:30:10' } });
    await userEvent.click(screen.getByText('Go'));

    expect(cb).toHaveBeenCalledExactlyOnceWith({
      DateTimeOriginal: '2025-07-15T12:30:10.000',
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

import { zodResolver } from '@hookform/resolvers/zod';
import { ExifData } from '@metadata-handler/exifdata';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import ExifInput from '../ExifInput';

interface TestContainerProps {
  cb?: (v: unknown) => void;
  tagName: keyof typeof ExifData.shape;
}

function TestContainer({ cb, tagName }: TestContainerProps) {
  const form = useForm({
    resolver: zodResolver(ExifData),
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((val) => cb?.(val))}>
        <ExifInput tagName={tagName} />
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

  describe('when the exif tag has description set', () => {
    it('shows the description', () => {
      render(<TestContainer tagName="ExposureCompensation" />);

      expect(
        screen.getByLabelText('ExposureCompensation'),
      ).toHaveAccessibleDescription('also called ExposureBiasValue');

      render(<TestContainer tagName="Artist" />);
      expect(screen.getByLabelText('Artist')).not.toHaveAccessibleDescription();
    });
  });

  describe('when the exif tag is an enum', () => {
    it('is a select input', async () => {
      const cb = vi.fn();
      render(<TestContainer tagName="Flash" cb={cb} />);

      const input = screen.getByLabelText('Flash');
      expect(input).toBeVisible();
      expect(input).toBeInstanceOf(HTMLSelectElement);

      const inputOptions = (input as HTMLSelectElement).options;
      const values = Array.from(inputOptions).map((a) => a.value);
      const expectedOptions = ExifData.shape.Flash.unwrap().options;
      expect(values).toEqual([''].concat(expectedOptions));

      await userEvent.selectOptions(input, 'Fired');
      await userEvent.click(screen.getByText('Go'));
      expect(cb).toHaveBeenCalledExactlyOnceWith({ Flash: 'Fired' });
    });
  });

  describe('when the exif tag is a date input', () => {
    test.each<TestContainerProps['tagName']>([
      'DateTimeOriginal',
      'CreateDate',
      'ModifyDate',
    ])('has a date input with seconds', async (tagName) => {
      const cb = vi.fn();
      render(<TestContainer tagName={tagName} cb={cb} />);

      const input = screen.getByLabelText(tagName);
      expect(input).toBeInstanceOf(HTMLInputElement);
      expect((input as HTMLInputElement).type).toEqual('datetime-local');
      expect(input).toHaveAttribute('step', '1');

      // datetime-local doesn't (currently) work with userEvent.type
      fireEvent.change(input, { target: { value: '2025-07-15 12:30:10' } });
      await userEvent.click(screen.getByText('Go'));

      expect(cb).toHaveBeenCalledExactlyOnceWith({
        [tagName]: '2025-07-15 12:30:10',
      });
    });

    it.todo('is valid if the date is typed or selected');
  });

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

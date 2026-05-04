import { type ExifData, exifDataResolver } from '@metadata-handler/exifdata';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import TextInput from '../TextInput';

type TestContainerProps = Parameters<typeof TextInput>[0] & {
  cb?: (v: unknown) => void;
  defaultValue?: string;
};

function TestContainer({
  cb,
  tagName,
  defaultValue,
  ...props
}: TestContainerProps) {
  const baseline =
    defaultValue !== undefined
      ? ({ [tagName]: defaultValue } as Partial<ExifData>)
      : ({} as Partial<ExifData>);

  const form = useForm({
    resolver: exifDataResolver,
    context: { baseline },
    defaultValues:
      defaultValue !== undefined
        ? ({ [tagName]: defaultValue } as Partial<ExifData>)
        : undefined,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((val) => cb?.(val))}>
        <TextInput tagName={tagName} {...props} />
        <button type="submit">Go</button>
      </form>
    </FormProvider>
  );
}

describe('TextInput', () => {
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

  it('can show a description', () => {
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

  describe('with a writeRule', () => {
    it('shows an inline error when a dirty value violates the rule', async () => {
      render(<TestContainer tagName="FNumber" />);

      const input = screen.getByLabelText('FNumber');
      await userEvent.type(input, 'f/8');
      await userEvent.click(screen.getByText('Go'));

      expect(input).toBeInvalid();
      expect(screen.getByText(/Must be a number/)).toBeVisible();
    });

    it('passes when a dirty value satisfies the rule', async () => {
      const cb = vi.fn();
      render(<TestContainer tagName="FNumber" cb={cb} />);

      const input = screen.getByLabelText('FNumber');
      await userEvent.type(input, '8');
      await userEvent.click(screen.getByText('Go'));

      expect(input).toBeValid();
      expect(cb).toHaveBeenCalledExactlyOnceWith({ FNumber: '8' });
    });

    it('passes when an untouched value would have failed the rule', async () => {
      const cb = vi.fn();
      render(
        <TestContainer tagName="FNumber" cb={cb} defaultValue="non-standard" />,
      );

      await userEvent.click(screen.getByText('Go'));

      expect(screen.getByLabelText('FNumber')).toBeValid();
      expect(cb).toHaveBeenCalledExactlyOnceWith({ FNumber: 'non-standard' });
    });

    it('ignores surrounding whitespace when validating', async () => {
      const cb = vi.fn();
      render(<TestContainer tagName="FNumber" cb={cb} />);

      const input = screen.getByLabelText('FNumber');
      await userEvent.type(input, '  8  ');
      await userEvent.click(screen.getByText('Go'));

      expect(input).toBeValid();
      expect(cb).toHaveBeenCalledExactlyOnceWith({ FNumber: '  8  ' });
    });
  });
});

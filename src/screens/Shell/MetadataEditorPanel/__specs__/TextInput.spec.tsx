import { zodResolver } from '@hookform/resolvers/zod';
import { ExifData } from '@metadata-handler/exifdata';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import TextInput from '../TextInput';

type TestContainerProps = Parameters<typeof TextInput>[0] & {
  cb?: (v: unknown) => void;
};

function TestContainer({ cb, tagName, ...props }: TestContainerProps) {
  const form = useForm({
    resolver: zodResolver(ExifData),
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
});

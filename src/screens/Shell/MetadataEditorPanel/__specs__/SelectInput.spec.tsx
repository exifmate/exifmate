import { zodResolver } from '@hookform/resolvers/zod';
import { ExifData, FLASH_OPTIONS } from '@metadata-handler/exifdata';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import SelectInput from '../SelectInput';

type TestContainerProps = Parameters<typeof SelectInput>[0] & {
  cb?: (v: unknown) => void;
  defaultValues?: Partial<ExifData>;
};

function TestContainer({
  cb,
  tagName,
  defaultValues,
  ...props
}: TestContainerProps) {
  const form = useForm({
    resolver: zodResolver(ExifData),
    defaultValues: defaultValues ?? ({ [tagName]: null } as Partial<ExifData>),
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((val) => cb?.(val))}>
        <SelectInput tagName={tagName} {...props} />
        <button type="submit">Go</button>
      </form>
    </FormProvider>
  );
}

type ValuesTestContainerProps = Parameters<typeof SelectInput>[0] & {
  values?: Partial<ExifData>;
};

function ValuesTestContainer({
  tagName,
  values,
  ...props
}: ValuesTestContainerProps) {
  const form = useForm({
    resolver: zodResolver(ExifData),
    defaultValues: { [tagName]: null } as Partial<ExifData>,
    values,
  });

  return (
    <FormProvider {...form}>
      <SelectInput tagName={tagName} {...props} />
    </FormProvider>
  );
}

describe('SelectInput', () => {
  it('can be a select input', async () => {
    const cb = vi.fn();
    render(<TestContainer tagName="Flash" options={FLASH_OPTIONS} cb={cb} />);

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

  describe('when the field has a non-standard value', () => {
    it('shows the non-standard value as a disabled option', async () => {
      render(
        <TestContainer
          tagName="Flash"
          options={FLASH_OPTIONS}
          defaultValues={{ Flash: 'bad value' }}
        />,
      );

      await userEvent.click(screen.getByLabelText('Flash'));
      const listbox = screen.getByRole('listbox');

      const customOption = within(listbox).getByRole('option', {
        name: 'bad value',
      });
      expect(customOption).toBeVisible();
      expect(customOption).toHaveAttribute('aria-disabled', 'true');
      expect(customOption).toHaveAttribute('data-selected', 'true');
    });

    it('keeps the non-standard value visible after switching to a standard value', async () => {
      const { rerender } = render(
        <TestContainer
          tagName="Flash"
          options={FLASH_OPTIONS}
          defaultValues={{ Flash: 'bad value' }}
        />,
      );

      await userEvent.click(screen.getByLabelText('Flash'));
      await userEvent.click(
        within(screen.getByRole('listbox')).getByRole('option', {
          name: 'Fired',
        }),
      );

      // Simulate a parent re-render (e.g. after save+re-read) — this causes SelectInput's body to
      // re-run with getValues('Flash') returning 'Fired'. Without the ref guard the non-standard
      // item would be overwritten and disappear.
      rerender(
        <TestContainer
          tagName="Flash"
          options={FLASH_OPTIONS}
          defaultValues={{ Flash: 'bad value' }}
        />,
      );

      await userEvent.click(screen.getByLabelText('Flash'));
      const listbox = screen.getByRole('listbox');
      const goodOption = within(listbox).getByRole('option', { name: 'Fired' });
      expect(goodOption).toHaveAttribute('data-selected', 'true');

      const customOption = within(listbox).getByRole('option', {
        name: 'bad value',
      });
      expect(customOption).toBeVisible();
      expect(customOption).toHaveAttribute('aria-disabled', 'true');
      expect(customOption).not.toHaveAttribute('data-selected');
    });

    it('shows the non-standard value when the form value is applied after mount', async () => {
      const { rerender } = render(
        <ValuesTestContainer tagName="Flash" options={FLASH_OPTIONS} />,
      );

      rerender(
        <ValuesTestContainer
          tagName="Flash"
          options={FLASH_OPTIONS}
          values={{ Flash: 'bad value' }}
        />,
      );

      await userEvent.click(screen.getByLabelText('Flash'));
      const customOption = await within(screen.getByRole('listbox')).findByRole(
        'option',
        {
          name: 'bad value',
        },
      );
      expect(customOption).toBeVisible();
      expect(customOption).toHaveAttribute('aria-disabled', 'true');
      expect(customOption).toHaveAttribute('data-selected', 'true');
    });
  });
});

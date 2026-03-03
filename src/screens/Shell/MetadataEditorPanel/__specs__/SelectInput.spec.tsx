import { zodResolver } from '@hookform/resolvers/zod';
import { ExifData, FLASH_OPTIONS } from '@metadata-handler/exifdata';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import SelectInput from '../SelectInput';

type TestContainerProps = Parameters<typeof SelectInput>[0] & {
  cb?: (v: unknown) => void;
};

function TestContainer({ cb, tagName, ...props }: TestContainerProps) {
  const form = useForm({
    resolver: zodResolver(ExifData),
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

  describe('when the input is a select', () => {
    it.todo('can show custom values');
  });
});

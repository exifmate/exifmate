import { zodResolver } from '@hookform/resolvers/zod';
import { ExifData } from '@metadata-handler/exifdata';
import { render } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import ExifTab from '../ExifTab';

function TestContainer() {
  const form = useForm({ resolver: zodResolver(ExifData) });
  return (
    <FormProvider {...form}>
      <ExifTab />
    </FormProvider>
  );
}

describe('ExifTab', () => {
  it('has an input for all tags that are not location related', () => {
    const { container } = render(<TestContainer />);

    const tagsInTab = Array.from(
      container.querySelectorAll('[data-slot="label"]'),
    )
      .map((l) => (l.textContent ?? '').split(' (')[0].trim())
      .filter(Boolean)
      .sort();

    const expectedTags = Object.keys(ExifData.shape)
      .filter((k) => !k.startsWith('GPS'))
      .sort();

    expect(tagsInTab).toEqual(expectedTags);
  });
});

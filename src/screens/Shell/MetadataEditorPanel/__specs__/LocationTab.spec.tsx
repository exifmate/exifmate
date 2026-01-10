import { zodResolver } from '@hookform/resolvers/zod';
import { ExifData } from '@metadata-handler/exifdata';
import { mockIPC } from '@tauri-apps/api/mocks';
import { load } from '@tauri-apps/plugin-store';
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import type { Mock } from 'vitest';
import LocationTab from '../LocationTab';

vi.mock('@tauri-apps/api/menu');
vi.mock('@tauri-apps/plugin-store', () => ({
  load: vi.fn<typeof load>(() => new Promise(() => {})),
}));
const loadMock = load as unknown as Mock<typeof load>;

vi.mock('react-map-gl/maplibre');

function TestContainer() {
  const form = useForm({
    resolver: zodResolver(ExifData),
  });

  return (
    <FormProvider {...form}>
      <LocationTab />
    </FormProvider>
  );
}

describe('LocationTab', () => {
  beforeEach(() => {
    mockIPC(() => {}, { shouldMockEvents: true });
  });

  it('has location inputs', () => {
    render(<TestContainer />);
    expect(screen.getByLabelText('GPSLatitude')).toBeVisible();
    expect(screen.getByLabelText('GPSLongitude')).toBeVisible();
  });

  it('indicates that the map is loading', async () => {
    render(<TestContainer />);
    expect(screen.getByTitle('Loading Map')).toBeVisible();
    expect(screen.queryByText('MapGL Output')).toBeNull();
  });

  describe('when the previous map state has loaded', () => {
    it('initially centers the map to London by default', async () => {
      loadMock.mockResolvedValueOnce(
        new Map() as unknown as Awaited<ReturnType<typeof load>>,
      );
      render(<TestContainer />);
      expect(screen.queryByText('Loading Map')).toBeNull();
      expect(await screen.findByText('MapGL Output')).toBeVisible();
    });

    it.todo('sets a pin to the form value');

    it.todo('updates the pin when the text input is updated');

    it.todo('does not break the map when a non-number is entered');

    it.todo('has no pin when there is no value for location');

    it.todo('handles one of the location fields is not set');

    describe('when the map is clicked', () => {
      it.todo('updates the location inputs');

      it.todo('dirties the form and triggers validation');

      it.todo('moves the pin');

      describe('when the form is disabled', () => {
        it.todo('does nothing');
      });
    });

    describe('when the map is moved', () => {
      it.todo('persists the centered location and zoom to the app state');

      it.todo('does not matter if the save fails');
    });

    describe('when the map has been moved', () => {
      it.todo(
        'initially centers the map and zoom to where it was last moved to',
      );
    });
  });
});

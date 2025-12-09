import useTauriListener from '@hooks/useTauriListener';
import type { ExifData } from '@metadata-handler/exifdata';
import { FOCUS_ON_LOCATION_EVENT } from '@platform/app-menu';
import { load } from '@tauri-apps/plugin-store';
import type { MapLibreEvent } from 'maplibre-gl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { MdLocationPin } from 'react-icons/md';
import MapGL, { type MapRef, Marker } from 'react-map-gl/maplibre';
import { z } from 'zod';

const Loc = z.object({
  lat: z.number(),
  lng: z.number(),
  zoom: z.number(),
});

type Loc = z.infer<typeof Loc>;

function LocationPin() {
  const { watch, getFieldState } = useFormContext<ExifData>();
  const lat = watch('GPSLatitude');
  const lon = watch('GPSLongitude');

  if (
    getFieldState('GPSLatitude').invalid ||
    getFieldState('GPSLongitude').invalid
  ) {
    return;
  }

  if (lat === undefined || lat === null || lon === undefined || lon === null) {
    return;
  }

  return (
    <Marker latitude={lat} longitude={lon} anchor="bottom">
      <MdLocationPin color="red" size={36} />
    </Marker>
  );
}

function LocationMap() {
  const mapRef = useRef<MapRef>(null);
  const [initialLoc, setInitialLoc] = useState<Loc | undefined>();
  const {
    setValue,
    getValues,
    formState: { disabled },
  } = useFormContext<ExifData>();

  useEffect(() => {
    load('state.json')
      .then((store) => store.get('initialLoc'))
      .then((raw) => Loc.safeParseAsync(raw))
      .then((savedInitialLoc) => {
        const DEFAULT_LOC: Loc = { lat: 0, lng: 0, zoom: 0 } as const;
        setInitialLoc(savedInitialLoc.data ?? DEFAULT_LOC);
      })
      .catch((err) => {
        console.error('Failed to load map state:', err);
      });
  }, []);

  useTauriListener(FOCUS_ON_LOCATION_EVENT, () => {
    if (!mapRef.current) {
      return;
    }

    const [lat, lon] = getValues(['GPSLatitude', 'GPSLongitude']);
    if (lat && lon) {
      mapRef.current.setCenter([lon, lat]);
    }
  });

  const onMapIdle = useCallback((e: MapLibreEvent) => {
    load('state.json')
      .then((store) => {
        const newInitialLoc: Loc = {
          ...e.target.getCenter(),
          zoom: e.target.getZoom(),
        };
        return store.set('initialLoc', newInitialLoc);
      })
      .catch((err) => {
        console.error('Failed to save new initial map location:', err);
      });
  }, []);

  if (!initialLoc) {
    return <div className="skeleton h-full w-full" title="Loading Map"></div>;
  }

  return (
    <MapGL
      ref={mapRef}
      reuseMaps
      initialViewState={{
        latitude: initialLoc.lat,
        longitude: initialLoc.lng,
        zoom: initialLoc.zoom,
      }}
      mapStyle="https://tiles.openfreemap.org/styles/bright"
      onClick={({ lngLat: { lat, lng } }) => {
        if (!disabled) {
          setValue('GPSLatitude', lat, {
            shouldDirty: true,
            shouldValidate: true,
          });
          setValue('GPSLongitude', lng, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      }}
      onIdle={onMapIdle}
    >
      <LocationPin />
    </MapGL>
  );
}

export default LocationMap;

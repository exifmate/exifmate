import { ExifData } from '@metadata-handler/exifdata';
import { load } from '@tauri-apps/plugin-store';
import type { MapLibreEvent } from 'maplibre-gl';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { MdLocationPin } from 'react-icons/md';
import MapGL, { Marker } from 'react-map-gl/maplibre';
import { z } from 'zod';

const Loc = z.object({
  lat: z.number(),
  lng: z.number(),
  zoom: z.number(),
});

type Loc = z.infer<typeof Loc>;

function LocationMap() {
  const [initialLoc, setInitialLoc] = useState<Loc | undefined>();
  const {
    setValue,
    watch,
    formState: { disabled },
  } = useFormContext<ExifData>();

  useEffect(() => {
    load('state.json')
      .then((store) => store.get('initialLoc'))
      .then((raw) => Loc.safeParseAsync(raw))
      .then((savedInitialLoc) => {
        const DEFAULT_LOC: Loc = { lat: 0, lng: 0, zoom: 0 } as const;
        setInitialLoc(savedInitialLoc.data ?? DEFAULT_LOC);
      });
  }, []);

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

  const getLoc = (part: 'GPSLatitude' | 'GPSLongitude'): number => {
    const val = watch(part);
    return ExifData.shape[part].safeParse(val).data ?? 0;
  };

  return (
    <MapGL
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
      <Marker
        latitude={getLoc('GPSLatitude')}
        longitude={getLoc('GPSLongitude')}
        anchor="bottom"
      >
        <MdLocationPin color="red" size={36} />
      </Marker>
    </MapGL>
  );
}

export default LocationMap;

import Fieldset from '@components/Fieldset';
import ExifInput from './ExifInput';
import LocationMap from './LocationMap';
import LocationPasteButton from './LocationPasteButton';

function LocationTab() {
  return (
    <div className="h-full flex flex-col gap-4 pt-4">
      <div className="min-h-52 grow rounded-box overflow-clip">
        <LocationMap />
      </div>

      <Fieldset legend="GPS">
        <div className="flex gap-3 items-center">
          <ExifInput tagName="GPSLatitude" />
          <ExifInput tagName="GPSLongitude" />

          <LocationPasteButton />
        </div>
      </Fieldset>
    </div>
  );
}

export default LocationTab;

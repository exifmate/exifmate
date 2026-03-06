import Fieldset from '@components/Fieldset';
import LocationMap from './LocationMap';
import LocationPasteButton from './LocationPasteButton';
import TextInput from './TextInput';

function LocationTab() {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="min-h-52 grow rounded-xl overflow-clip">
        <LocationMap />
      </div>

      <Fieldset legend="GPS">
        <div className="flex gap-3 items-end">
          <TextInput tagName="GPSLatitude" />
          <TextInput tagName="GPSLongitude" />

          <LocationPasteButton />
        </div>
      </Fieldset>
    </div>
  );
}

export default LocationTab;

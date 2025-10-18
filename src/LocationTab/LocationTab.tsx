import Fieldset from '@app/components/Fieldset';
import ExifInput from '@app/screens/Shell/MetadataEditorPanel/ExifInput';
import LocationPasteButton from './LocationPasteButton';
import TheMap from './TheMap';

function LocationTab() {
  return (
    <div className="h-full flex flex-col gap-4 pt-4">
      <div className="min-h-52 grow rounded-box overflow-clip">
        <TheMap />
      </div>

      <Fieldset legend="GPS">
        <div className="flex gap-3 items-end">
          <ExifInput tagName="GPSLatitude" />
          <ExifInput tagName="GPSLongitude" />

          <LocationPasteButton />
        </div>
      </Fieldset>
    </div>
  );
}

export default LocationTab;

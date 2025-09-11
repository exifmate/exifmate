import Fieldset from '../components/Fieldset';
import ExifInput from '../Editor/ExifInput';
import TheMap from './TheMap';

function LocationTab() {
  return (
    <div className="h-full flex flex-col">
      <div className="min-h-52 grow rounded-xl overflow-clip">
        <TheMap />
      </div>

      <Fieldset legend="GPS">
        <div className="flex gap-3">
          <ExifInput tagName="GPSLatitude" />
          <ExifInput tagName="GPSLongitude" />
        </div>
      </Fieldset>
    </div>
  );
}

export default LocationTab;

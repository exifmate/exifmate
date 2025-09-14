import type { ExifData } from '@app/core/types';
import { readText } from '@tauri-apps/plugin-clipboard-manager';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { MdContentPaste } from 'react-icons/md';

const PASTE_LABEL = 'Paste Location';
const PASTED_LABEL = 'Location Pasted!';

function LocationPasteButton() {
  const {
    setValue,
    formState: { disabled },
  } = useFormContext<ExifData>();

  const [labelText, setLabelText] = useState<string>(PASTE_LABEL);

  return (
    <div className="tooltip tooltip-info tooltip-left">
      <div
        id="location-paste-tooltip"
        className="tooltip-content"
        aria-controls="location-paste-button"
        aria-hidden
        aria-live="polite"
      >
        {labelText}
      </div>

      <button
        type="button"
        id="location-paste-button"
        className="btn btn-sm btn-soft btn-info"
        aria-labelledby="location-paste-tooltip"
        disabled={disabled}
        onClick={async () => {
          const text = await readText();
          const [lat, lon] = text.split(',').map((l) => parseFloat(l));

          if (lat) {
            setValue('GPSLatitude', lat, { shouldValidate: true });
          }
          if (lon) {
            setValue('GPSLongitude', lon, { shouldValidate: true });
          }

          setLabelText(PASTED_LABEL);
          setTimeout(() => {
            setLabelText(PASTE_LABEL);
          }, 2_000);
        }}
      >
        <MdContentPaste />
      </button>
    </div>
  );
}

export default LocationPasteButton;

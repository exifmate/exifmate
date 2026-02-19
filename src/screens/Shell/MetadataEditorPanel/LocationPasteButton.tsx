import { Button, Tooltip } from '@heroui/react';
import type { ExifData } from '@metadata-handler/exifdata';
import { readText } from '@tauri-apps/plugin-clipboard-manager';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { HiClipboardDocument } from 'react-icons/hi2';

const PASTE_LABEL = 'Paste Location';
const PASTED_LABEL = 'Location Pasted!';

function LocationPasteButton() {
  const {
    setValue,
    formState: { disabled },
  } = useFormContext<ExifData>();

  const [labelText, setLabelText] = useState<string>(PASTE_LABEL);

  const pasteLocation = async () => {
    const text = await readText();
    const [lat, lon] = text.split(',').map((l) => parseFloat(l));

    if (lat) {
      setValue('GPSLatitude', lat, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    if (lon) {
      setValue('GPSLongitude', lon, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    setLabelText(PASTED_LABEL);
    setTimeout(() => {
      setLabelText(PASTE_LABEL);
    }, 2_000);
  };

  return (
    <Tooltip delay={0} closeDelay={0}>
      <Button
        variant="tertiary"
        isIconOnly
        isDisabled={disabled}
        onPress={pasteLocation}
      >
        <HiClipboardDocument />
      </Button>
      <Tooltip.Content>
        {labelText}
      </Tooltip.Content>
    </Tooltip>
  );
}

export default LocationPasteButton;

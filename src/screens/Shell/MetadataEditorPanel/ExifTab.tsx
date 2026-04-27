import Fieldset from '@components/Fieldset';
import {
  EXPOSURE_MODE_OPTIONS,
  EXPOSURE_PROGRAM_OPTIONS,
  FLASH_OPTIONS,
  METERING_MODE_OPTIONS,
  ORIENTATION_OPTIONS,
  SATURATION_OPTIONS,
  SHARPNESS_OPTIONS,
  WHITE_BALANCE_OPTIONS,
} from '@metadata-handler/exifdata';
import DateTimeInput from './DateTimeInput';
import SelectInput from './SelectInput';
import TextInput from './TextInput';

function ExifTab() {
  return (
    <div className="flex flex-col gap-4">
      <Fieldset legend="Date and Time">
        <DateTimeInput tagName="DateTimeOriginal" />
        <DateTimeInput tagName="CreateDate" description="(DateTimeDigitized)" />
        <DateTimeInput tagName="ModifyDate" />
        {/* TODO: add sync all checkbox */}
      </Fieldset>

      <Fieldset legend="General">
        <TextInput tagName="Artist" />
        <TextInput tagName="ImageDescription" />
        <TextInput tagName="Copyright" />
        <TextInput tagName="Software" />
        <TextInput tagName="UserComment" />
      </Fieldset>

      <Fieldset legend="Camera">
        <TextInput tagName="Make" />
        <TextInput tagName="Model" />
        <TextInput tagName="SerialNumber" description="(BodySerialNumber)" />
      </Fieldset>

      <Fieldset legend="Camera Settings">
        <TextInput tagName="ISO" />
        <TextInput tagName="FNumber" />
        {/* <TextInput tagName="ShutterSpeed" /> */}
        <TextInput tagName="FocalLength" />
        <TextInput
          tagName="FocalLengthIn35mmFormat"
          description="(FocalLengthIn35mmFilm)"
        />
        <TextInput
          tagName="ExposureCompensation"
          description="(ExposureBiasValue)"
        />
        <SelectInput tagName="Flash" options={FLASH_OPTIONS} />
        {/* <TextInput tagName="ColorSpace" /> */}
        <TextInput tagName="MaxApertureValue" />
        <SelectInput tagName="ExposureMode" options={EXPOSURE_MODE_OPTIONS} />
        <SelectInput
          tagName="ExposureProgram"
          options={EXPOSURE_PROGRAM_OPTIONS}
        />
        <TextInput tagName="ExposureTime" />
        <SelectInput tagName="MeteringMode" options={METERING_MODE_OPTIONS} />
        <SelectInput tagName="WhiteBalance" options={WHITE_BALANCE_OPTIONS} />
        <SelectInput tagName="Saturation" options={SATURATION_OPTIONS} />
        <SelectInput tagName="Sharpness" options={SHARPNESS_OPTIONS} />
      </Fieldset>

      <Fieldset legend="Lens">
        <TextInput tagName="LensMake" />
        <TextInput tagName="LensModel" />
        <TextInput tagName="Lens" />
        <TextInput tagName="LensSerialNumber" />
      </Fieldset>

      <Fieldset legend="Dimensions and Resolution">
        <SelectInput tagName="Orientation" options={ORIENTATION_OPTIONS} />
        <TextInput tagName="ExifImageWidth" description="(PixelXDimension)" />
        <TextInput tagName="ExifImageHeight" description="(PixelYDimension)" />
        <TextInput tagName="XResolution" />
        <TextInput tagName="YResolution" />
      </Fieldset>
    </div>
  );
}

export default ExifTab;

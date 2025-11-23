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
import ExifInput from './ExifInput';

function ExifTab() {
  return (
    <div className="flex flex-col gap-4">
      <Fieldset legend="Date and Time">
        <ExifInput tagName="DateTimeOriginal" type="datetime-local" />
        <ExifInput
          tagName="CreateDate"
          type="datetime-local"
          description="(DateTimeDigitized)"
        />
        <ExifInput tagName="ModifyDate" type="datetime-local" />
        {/* TODO: add sync all checkbox */}
      </Fieldset>

      <Fieldset legend="General">
        <ExifInput tagName="Artist" />
        <ExifInput tagName="ImageDescription" />
        <ExifInput tagName="Copyright" />
        <ExifInput tagName="Software" />
        <ExifInput tagName="UserComment" />
      </Fieldset>

      <Fieldset legend="Camera">
        <ExifInput tagName="Make" />
        <ExifInput tagName="Model" />
        <ExifInput tagName="SerialNumber" description="(BodySerialNumber)" />
      </Fieldset>

      <Fieldset legend="Camera Settings">
        <ExifInput tagName="ISO" />
        <ExifInput tagName="FNumber" />
        {/* <ExifInput tagName="ShutterSpeed" /> */}
        <ExifInput tagName="FocalLength" />
        <ExifInput
          tagName="FocalLengthIn35mmFormat"
          description="(FocalLengthIn35mmFilm)"
        />
        <ExifInput
          tagName="ExposureCompensation"
          description="(ExposureBiasValue)"
        />
        <ExifInput tagName="Flash" type="select" options={FLASH_OPTIONS} />
        {/* <ExifInput tagName="ColorSpace" /> */}
        <ExifInput tagName="MaxApertureValue" />
        <ExifInput
          tagName="ExposureMode"
          type="select"
          options={EXPOSURE_MODE_OPTIONS}
        />
        <ExifInput
          tagName="ExposureProgram"
          type="select"
          options={EXPOSURE_PROGRAM_OPTIONS}
        />
        <ExifInput tagName="ExposureTime" />
        <ExifInput
          tagName="MeteringMode"
          type="select"
          options={METERING_MODE_OPTIONS}
        />
        <ExifInput
          tagName="WhiteBalance"
          type="select"
          options={WHITE_BALANCE_OPTIONS}
        />
        <ExifInput
          tagName="Saturation"
          type="select"
          options={SATURATION_OPTIONS}
        />
        <ExifInput
          tagName="Sharpness"
          type="select"
          options={SHARPNESS_OPTIONS}
        />
      </Fieldset>

      <Fieldset legend="Lens">
        <ExifInput tagName="LensMake" />
        <ExifInput tagName="LensModel" />
        <ExifInput tagName="Lens" />
        <ExifInput tagName="LensSerialNumber" />
      </Fieldset>

      <Fieldset legend="Dimensions and Resolution">
        <ExifInput
          tagName="Orientation"
          type="select"
          options={ORIENTATION_OPTIONS}
        />
        <ExifInput tagName="ExifImageWidth" description="(PixelXDimension)" />
        <ExifInput tagName="ExifImageHeight" description="(PixelYDimension)" />
      </Fieldset>
    </div>
  );
}

export default ExifTab;

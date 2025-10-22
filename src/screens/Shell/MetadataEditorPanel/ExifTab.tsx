import Fieldset from '@components/Fieldset';
import ExifInput from './ExifInput';

function ExifTab() {
  return (
    <div className="flex flex-col gap-4">
      <Fieldset legend="Date and Time">
        <ExifInput tagName="DateTimeOriginal" />
        <ExifInput tagName="CreateDate" />
        <ExifInput tagName="ModifyDate" />
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
        <ExifInput tagName="SerialNumber" />
      </Fieldset>

      <Fieldset legend="Camera Settings">
        <ExifInput tagName="ISO" />
        <ExifInput tagName="FNumber" />
        {/* <ExifInput tagName="ShutterSpeed" /> */}
        <ExifInput tagName="FocalLength" />
        <ExifInput tagName="FocalLengthIn35mmFormat" />
        <ExifInput tagName="ExposureCompensation" />
        <ExifInput tagName="Flash" />

        {/* <ExifInput tagName="ColorSpace" /> */}
        <ExifInput tagName="MaxApertureValue" />
        <ExifInput tagName="ExposureMode" />
        <ExifInput tagName="ExposureProgram" />
        <ExifInput tagName="ExposureTime" />
        <ExifInput tagName="MeteringMode" />
        <ExifInput tagName="WhiteBalance" />
        <ExifInput tagName="Saturation" />
        <ExifInput tagName="Sharpness" />
      </Fieldset>

      <Fieldset legend="Lens">
        <ExifInput tagName="LensMake" />
        <ExifInput tagName="LensModel" />
        <ExifInput tagName="Lens" />
        <ExifInput tagName="LensSerialNumber" />
      </Fieldset>

      <Fieldset legend="Dimensions and Resolution">
        <ExifInput tagName="Orientation" />
        <ExifInput tagName="ExifImageWidth" />
        <ExifInput tagName="ExifImageHeight" />
      </Fieldset>
    </div>
  );
}

export default ExifTab;

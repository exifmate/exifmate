import { type ZodType, z } from 'zod';

export const FLASH_OPTIONS = [
  'No Flash',
  'Fired',
  'Fired, Return not detected',
  'Fired, Return detected',
  'On, Did not fire',
  'On, Fired',
  'On, Return not detected',
  'On, Return detected',
  'Off, Did not fire',
  'Off, Did not fire, Return not detected',
  'Auto, Did not fire',
  'Auto, Fired',
  'Auto, Fired, Return not detected',
  'Auto, Fired, Return detected',
  'No flash function',
  'Off, No flash function',
  'Fired, Red-eye reduction',
  'Fired, Red-eye reduction, Return not detected',
  'Fired, Red-eye reduction, Return detected',
  'On, Red-eye reduction',
  'On, Red-eye reduction, Return not detected',
  'On, Red-eye reduction, Return detected',
  'Off, Red-eye reduction',
  'Auto, Did not fire, Red-eye reduction',
  'Auto, Fired, Red-eye reduction',
  'Auto, Fired, Red-eye reduction, Return not detected',
  'Auto, Fired, Red-eye reduction, Return detected',
] as const;

export const EXPOSURE_MODE_OPTIONS = [
  'Auto',
  'Manual',
  'Auto bracket',
] as const;

export const EXPOSURE_PROGRAM_OPTIONS = [
  'Not Defined',
  'Manual',
  'Program AE',
  'Aperture-priority AE',
  'Shutter speed priority AE',
  'Creative (Slow speed)',
  'Action (High speed)',
  'Portrait',
  'Landscape',
  'Bulb', // should I note this is non-standard?
] as const;

export const METERING_MODE_OPTIONS = [
  'Unknown',
  'Average',
  'Center-weighted average',
  'Spot',
  'Multi-spot',
  'Multi-segment',
  'Partial',
  'Other',
] as const;

export const WHITE_BALANCE_OPTIONS = ['Auto', 'Manual'] as const;

export const SATURATION_OPTIONS = ['Normal', 'Low', 'High'] as const;

export const SHARPNESS_OPTIONS = ['Normal', 'Soft', 'Hard'] as const;

export const ORIENTATION_OPTIONS = [
  'Horizontal (normal)',
  'Mirror horizontal',
  'Rotate 180',
  'Mirror vertical',
  'Mirror horizontal and rotate 270 CW',
  'Rotate 90 CW',
  'Mirror horizontal and rotate 90 CW',
  'Rotate 270 CW',
] as const;

const coercedEnum = (OPTS: readonly string[]) =>
  z.preprocess((v) => {
    if (typeof v === 'number') {
      return OPTS[v];
    }
    if (v === '') {
      return undefined;
    }

    return v;
  }, z.enum(OPTS).optional());

// This exists because if `z.coerce.number` is given `''`
// it will turn into `0` and not remove the field.
function emptyToUndef<T extends ZodType>(schema: T) {
  return z.preprocess((v) => (v !== '' ? v : undefined), schema).optional();
}

// Need to think about how to handle if an enum gains an option,
// specifically how to futureproof without needing to update if I stop maintaining
export const ExifData = z.object({
  Artist: z.coerce.string().optional().nullable(),
  ImageDescription: z.coerce.string().optional().nullable(),
  Copyright: z.coerce.string().optional().nullable(),
  Software: z.coerce.string().optional().nullable(),
  UserComment: z.string().optional().nullable(),
  DateTimeOriginal: z.string().optional().nullable(),
  CreateDate: z.string().optional().nullable(),
  ModifyDate: z.string().optional().nullable(),
  Make: z.coerce.string().optional().nullable(),
  Model: z.coerce.string().optional().nullable(),
  SerialNumber: z.coerce.string().optional().nullable(),
  ISO: emptyToUndef(z.coerce.number().optional().nullable()),
  FNumber: z.coerce.string().optional().nullable(),
  // ShutterSpeed: z.number().optional(), // doesn't seem to want value at end // TODO: need to not save this
  FocalLength: z.coerce.string().optional().nullable(),
  FocalLengthIn35mmFormat: z.coerce.string().optional().nullable(),
  ExposureCompensation: z.coerce.string().optional().nullable(),
  Flash: coercedEnum(FLASH_OPTIONS).optional().nullable(),
  // ColorSpace: z.string(),
  MaxApertureValue: z.coerce.number().optional().nullable(),
  ExposureMode: coercedEnum(EXPOSURE_MODE_OPTIONS).optional().nullable(),
  ExposureProgram: coercedEnum(EXPOSURE_PROGRAM_OPTIONS).optional().nullable(),
  ExposureTime: z.coerce.string().optional().nullable(),
  MeteringMode: coercedEnum(METERING_MODE_OPTIONS).optional().nullable(),
  WhiteBalance: coercedEnum(WHITE_BALANCE_OPTIONS).optional().nullable(),
  Saturation: coercedEnum(SATURATION_OPTIONS).optional().nullable(),
  Sharpness: coercedEnum(SHARPNESS_OPTIONS).optional().nullable(),
  LensMake: z.coerce.string().optional().nullable(),
  LensModel: z.coerce.string().optional().nullable(),
  Lens: z.coerce.string().optional().nullable(),
  LensSerialNumber: z.coerce.string().optional().nullable(),
  Orientation: coercedEnum(ORIENTATION_OPTIONS).optional().nullable(),
  ExifImageWidth: emptyToUndef(z.coerce.number().optional().nullable()),
  ExifImageHeight: emptyToUndef(z.coerce.number().optional().nullable()),
  XResolution: emptyToUndef(z.coerce.number().optional().optional().nullable()),
  YResolution: emptyToUndef(z.coerce.number().optional().nullable()),
  GPSLatitude: emptyToUndef(
    z.coerce.number().min(-90).max(90).optional().nullable(),
  ),
  GPSLongitude: emptyToUndef(
    z.coerce.number().min(-180).max(180).optional().nullable(),
  ),
});

export type ExifData = z.infer<typeof ExifData>;

export const defaultExifData: ExifData = {
  Artist: null,
  ImageDescription: null,
  Copyright: null,
  Software: null,
  UserComment: null,
  DateTimeOriginal: null,
  CreateDate: null,
  ModifyDate: null,
  Make: null,
  Model: null,
  SerialNumber: null,
  ISO: null,
  FNumber: null,
  FocalLength: null,
  FocalLengthIn35mmFormat: null,
  ExposureCompensation: null,
  Flash: null,
  MaxApertureValue: null,
  ExposureMode: null,
  ExposureProgram: null,
  ExposureTime: null,
  MeteringMode: null,
  WhiteBalance: null,
  Saturation: null,
  Sharpness: null,
  LensMake: null,
  LensModel: null,
  Lens: null,
  LensSerialNumber: null,
  Orientation: null,
  ExifImageWidth: null,
  ExifImageHeight: null,
  XResolution: null,
  YResolution: null,
  GPSLatitude: null,
  GPSLongitude: null,
};

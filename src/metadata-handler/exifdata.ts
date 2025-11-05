import { z } from 'zod';

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

// Need to think about how to handle if an enum gains an option,
// specifically how to futureproof without needing to update if I stop maintaining
export const ExifData = z.object({
  Artist: z.coerce.string().optional(),
  ImageDescription: z.coerce.string().optional(),
  Copyright: z.coerce.string().optional(),
  Software: z.coerce.string().optional(),
  UserComment: z.string().optional(),
  DateTimeOriginal: z.string().optional(),
  CreateDate: z.string().optional(),
  ModifyDate: z.string().optional(),
  Make: z.coerce.string().optional(),
  Model: z.coerce.string().optional(),
  SerialNumber: z.coerce.string().optional(),
  ISO: z.coerce.number().optional(),
  FNumber: z.coerce.string().optional(),
  // ShutterSpeed: z.number().optional(), // doesn't seem to want value at end // TODO: need to not save this
  FocalLength: z.coerce.string().optional(),
  FocalLengthIn35mmFormat: z.coerce.string().optional(),
  ExposureCompensation: z.coerce.string().optional(),
  Flash: coercedEnum(FLASH_OPTIONS).optional(),
  // ColorSpace: z.string(),
  MaxApertureValue: z.coerce.number().optional(),
  ExposureMode: coercedEnum(EXPOSURE_MODE_OPTIONS).optional(),
  ExposureProgram: coercedEnum(EXPOSURE_PROGRAM_OPTIONS).optional(),
  ExposureTime: z.coerce.string().optional(),
  MeteringMode: coercedEnum(METERING_MODE_OPTIONS).optional(),
  WhiteBalance: coercedEnum(WHITE_BALANCE_OPTIONS).optional(),
  Saturation: coercedEnum(SATURATION_OPTIONS).optional(),
  Sharpness: coercedEnum(SHARPNESS_OPTIONS).optional(),
  LensMake: z.coerce.string().optional(),
  LensModel: z.coerce.string().optional(),
  Lens: z.coerce.string().optional(),
  LensSerialNumber: z.coerce.string().optional(),
  Orientation: coercedEnum(ORIENTATION_OPTIONS).optional(),
  ExifImageWidth: z.coerce.number().optional(),
  ExifImageHeight: z.coerce.number().optional(),
  XResolution: z.coerce.number().optional(),
  YResolution: z.coerce.number().optional(),
  GPSLatitude: z.coerce.number().min(-90).max(90).optional(),
  GPSLongitude: z.coerce.number().min(-180).max(180).optional(),
});

export type ExifData = z.infer<typeof ExifData>;

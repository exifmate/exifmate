import { z } from 'zod';

// Need to think about how to handle if an enum gains an option,
// specifically how to futureproof without needing to update if I stop maintaining
export const ExifData = z.object({
  Artist: z.coerce.string().optional(),
  ImageDescription: z.coerce.string().optional(),
  Copyright: z.coerce.string().optional(),
  Software: z.coerce.string().optional(),
  UserComment: z.string().optional(),
  DateTimeOriginal: z.string().optional(),
  CreateDate: z
    .string()
    .meta({
      description: 'DateTimeDigitized',
    })
    .optional(),
  ModifyDate: z.string().optional(),
  Make: z.coerce.string().optional(),
  Model: z.coerce.string().optional(),
  SerialNumber: z.coerce
    .string()
    .meta({
      description: 'BodySerialNumber',
    })
    .optional(),
  ISO: z.coerce.number().optional(),
  FNumber: z.coerce.string().optional(),
  // ShutterSpeed: z.number().optional(), // doesn't seem to want value at end // TODO: need to not save this
  FocalLength: z.coerce.string().optional(),
  FocalLengthIn35mmFormat: z.coerce
    .string()
    .meta({
      description: 'FocalLengthIn35mmFilm',
    })
    .optional(),
  ExposureCompensation: z.coerce
    .string()
    .meta({
      description: 'ExposureBiasValue',
    })
    .optional(),
  Flash: z
    .enum([
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
    ])
    .optional(),
  // ColorSpace: z.string(),
  MaxApertureValue: z.coerce.number().optional(),
  ExposureMode: z.enum(['Auto', 'Manual', 'Auto bracket']).optional(),
  ExposureProgram: z
    .enum([
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
    ])
    .optional(),
  ExposureTime: z.coerce.string().optional(),
  MeteringMode: z
    .enum([
      'Unknown',
      'Average',
      'Center-weighted average',
      'Spot',
      'Multi-spot',
      'Multi-segment',
      'Partial',
      'Other',
    ])
    .optional(),
  WhiteBalance: z.enum(['Auto', 'Manual']).optional(),
  Saturation: z.enum(['Normal', 'Low', 'High']).optional(),
  Sharpness: z.enum(['Normal', 'Soft', 'Hard']).optional(),
  LensMake: z.coerce.string().optional(),
  LensModel: z.coerce.string().optional(),
  Lens: z.coerce.string().optional(),
  LensSerialNumber: z.coerce.string().optional(),
  Orientation: z
    .enum([
      'Horizontal (normal)',
      'Mirror horizontal',
      'Rotate 180',
      'Mirror vertical',
      'Mirror horizontal and rotate 270 CW',
      'Rotate 90 CW',
      'Mirror horizontal and rotate 90 CW',
      'Rotate 270 CW',
    ])
    .optional(),
  ExifImageWidth: z.coerce
    .number()
    .meta({ description: 'PixelXDimension' })
    .optional(),
  ExifImageHeight: z.coerce
    .number()
    .meta({ description: 'PixelYDimension' })
    .optional(),
  XResolution: z.coerce.number().optional(),
  YResolution: z.coerce.number().optional(),
  GPSLatitude: z.coerce.number().min(-90).max(90).optional(),
  GPSLongitude: z.coerce.number().min(-180).max(180).optional(),
});

export type ExifData = z.infer<typeof ExifData>;

import { ExifData, exifDataResolver, writeRules } from '../exifdata';

describe('ExifData', () => {
  it.each<[keyof ExifData, string]>([
    ['Flash', 'Fired'],
    ['ExposureMode', 'Manual'],
    ['ExposureProgram', 'Manual'],
    ['MeteringMode', 'Average'],
    ['WhiteBalance', 'Manual'],
    ['Saturation', 'Low'],
    ['Sharpness', 'Soft'],
    ['Orientation', 'Mirror horizontal'],
  ])('has enums that can be given numbers or nothing', (tag, secondValue) => {
    const expected = { [tag]: secondValue };
    expect(ExifData.parse({ [tag]: undefined })).toEqual({});
    expect(ExifData.parse({ [tag]: '' })).toEqual({ [tag]: '' });
    expect(ExifData.parse({ [tag]: secondValue, fake: 'tag' })).toEqual(
      expected,
    );
  });
});

describe('writeRules', () => {
  it.each<[keyof typeof writeRules, string]>([
    ['FNumber', '8'],
    ['FNumber', '8.0'],
    ['FNumber', '2.8'],
    ['FocalLength', '35'],
    ['FocalLength', '35mm'],
    ['FocalLength', '35 mm'],
    ['FocalLengthIn35mmFormat', '50'],
    ['FocalLengthIn35mmFormat', '50mm'],
    ['ExposureCompensation', '0'],
    ['ExposureCompensation', '+0.7'],
    ['ExposureCompensation', '-1'],
    ['ExposureCompensation', '1.5'],
    ['ExposureTime', '0.004'],
    ['ExposureTime', '1/250'],
    ['ExposureTime', '30'],
    ['MaxApertureValue', '2.8'],
    ['ISO', '100'],
    ['ExifImageWidth', '4000'],
    ['ExifImageHeight', '3000'],
    ['XResolution', '300'],
    ['XResolution', '300.5'],
    ['YResolution', '72'],
  ])('%s accepts %s', (tag, value) => {
    const rule = writeRules[tag];
    expect(rule).toBeDefined();
    expect(rule!.safeParse(value).success).toBe(true);
  });

  it.each<[keyof typeof writeRules, string]>([
    ['FNumber', 'f/8'],
    ['FNumber', '8mm'],
    ['FNumber', 'eight'],
    ['FocalLength', 'f/35'],
    ['FocalLength', '35cm'],
    ['FocalLengthIn35mmFormat', 'f/50'],
    ['ExposureCompensation', 'EV+1'],
    ['ExposureCompensation', '+'],
    ['ExposureTime', '1/'],
    ['ExposureTime', '1/abc'],
    ['ExposureTime', 'abc'],
    ['MaxApertureValue', 'f/2.8'],
    ['ISO', '100.5'],
    ['ISO', 'auto'],
    ['ExifImageWidth', '4000.5'],
    ['ExifImageWidth', '4000px'],
    ['XResolution', 'abc'],
  ])('%s rejects %s', (tag, value) => {
    const rule = writeRules[tag];
    expect(rule).toBeDefined();
    expect(rule!.safeParse(value).success).toBe(false);
  });
});

describe('exifDataResolver', () => {
  const callResolver = (
    baseline: Partial<ExifData>,
    values: Partial<ExifData>,
  ) =>
    exifDataResolver(
      values as ExifData,
      { baseline },
      {
        criteriaMode: 'firstError',
        fields: {},
        shouldUseNativeValidation: false,
      },
    );

  it('emits no errors when no field differs from baseline', async () => {
    const result = await callResolver({ FNumber: '5.6' }, { FNumber: '5.6' });
    expect(result.errors).toEqual({});
  });

  it('emits a writeRule error for a value that differs from baseline and fails its rule', async () => {
    const result = await callResolver({}, { FNumber: 'f/8' });
    expect(result.errors).toMatchObject({
      FNumber: {
        type: 'writeRule',
        message: expect.stringMatching(/Must be a number/),
      },
    });
  });

  it('passes a value that differs from baseline and satisfies its rule', async () => {
    const result = await callResolver({}, { FNumber: '8' });
    expect(result.errors).toEqual({});
  });

  it('does not run a rule on an untouched non-conforming baseline value', async () => {
    const result = await callResolver(
      { FNumber: 'non-standard' },
      { FNumber: 'non-standard' },
    );
    expect(result.errors).toEqual({});
  });

  it('trims surrounding whitespace before checking the rule', async () => {
    const result = await callResolver({}, { FNumber: '  8  ' });
    expect(result.errors).toEqual({});
  });

  it('treats empty-string and null as cleared (no rule check)', async () => {
    const cleared = await callResolver({ FNumber: '5.6' }, { FNumber: '' });
    expect(cleared.errors).toEqual({});
    const nulled = await callResolver({ FNumber: '5.6' }, { FNumber: null });
    expect(nulled.errors).toEqual({});
  });
});

import { ExifData } from '../exifdata';

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

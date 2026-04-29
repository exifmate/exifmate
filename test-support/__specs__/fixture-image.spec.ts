import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { ImageOne } from '../fake-images';
import { withFixtureImage, withFixtureImages } from '../fixture-image';

describe('withFixtureImage', () => {
  let capturedPath: string;

  it('writes the fixture buffer to a temp file and returns ImageInfo', async () => {
    const info = await withFixtureImage(ImageOne);
    capturedPath = info.path;

    expect(info.filename).toBe('fixture.jpg');
    expect(existsSync(info.path)).toBe(true);
    const onDisk = await readFile(info.path);
    expect(Buffer.compare(onDisk, Buffer.from(ImageOne))).toBe(0);
  });

  it('cleans up the temp file after the previous test finished', () => {
    expect(existsSync(capturedPath)).toBe(false);
  });
});

describe('withFixtureImages', () => {
  it('writes multiple fixture buffers to temp files', async () => {
    const [one, two] = await withFixtureImages([
      { buffer: ImageOne, filename: 'one.jpg' },
      { buffer: ImageOne, filename: 'two.jpg' },
    ]);

    expect(one.filename).toBe('one.jpg');
    expect(two.filename).toBe('two.jpg');
    expect(existsSync(one.path)).toBe(true);
    expect(existsSync(two.path)).toBe(true);
    expect(one.path).not.toBe(two.path);
  });
});

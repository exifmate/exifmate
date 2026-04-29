import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ImageInfo } from '@platform/file-manager';
import { onTestFinished } from 'vitest';

export async function withFixtureImage(
  buffer: Uint8Array,
  filename = 'fixture.jpg',
): Promise<ImageInfo> {
  const dir = await mkdtemp(join(tmpdir(), 'exifmate-fixture-'));
  const path = join(dir, filename);
  await writeFile(path, buffer);
  onTestFinished(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return { path, filename };
}

export interface FixtureSpec {
  buffer: Uint8Array;
  filename: string;
}

export async function withFixtureImages(
  specs: FixtureSpec[],
): Promise<ImageInfo[]> {
  const dir = await mkdtemp(join(tmpdir(), 'exifmate-fixtures-'));
  const infos: ImageInfo[] = [];
  for (const { buffer, filename } of specs) {
    const path = join(dir, filename);
    await writeFile(path, buffer);
    infos.push({ path, filename });
  }
  onTestFinished(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return infos;
}

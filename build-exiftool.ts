import { execSync } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import { platform, tmpdir } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { extract } from 'tar';
import unzipper from 'unzipper';

const onWindows = platform() === 'win32';

console.log('Resolving current ExifTool version...');
const versionRes = await fetch(
  'https://sourceforge.net/projects/exiftool/files/ver.txt/download',
);
if (!versionRes.ok) {
  throw new Error(
    `Failed to resolve current ExifTool version: HTTP ${versionRes.status}`,
  );
}
const version = (await versionRes.text()).trim();
if (!/^\d+\.\d+$/.test(version)) {
  throw new Error(
    `Failed to resolve current ExifTool version: unexpected body ${JSON.stringify(version)}`,
  );
}

const exiftoolName = onWindows
  ? `exiftool-${version}_64`
  : `Image-ExifTool-${version}`;
const downloadFileName = onWindows
  ? `${exiftoolName}.zip`
  : `${exiftoolName}.tar.gz`;
const downloadUrl = `https://sourceforge.net/projects/exiftool/files/${downloadFileName}`;

console.log(`Let's get ${exiftoolName}`);

console.log('Downloading...');
const res = await fetch(downloadUrl);
if (!res.ok || res.body === null) {
  throw new Error(`Failed to download ${downloadFileName}: HTTP ${res.status}`);
}

const tempDir = process.env.RUNNER_TEMP ?? (await fs.mkdtemp(tmpdir()));
const archivePath = path.join(tempDir, downloadFileName);

try {
  await pipeline(Readable.from(res.body), createWriteStream(archivePath));

  console.log('Extracting...');

  const extractedPath = path.join(tempDir, exiftoolName);
  let distPath: string;

  if (onWindows) {
    const zipDir = await unzipper.Open.file(archivePath);
    await zipDir.extract({ path: tempDir });
    distPath = extractedPath;

    await fs.rename(
      path.join(distPath, 'exiftool(-k).exe'),
      path.join(distPath, 'exiftool.exe'),
    );
  } else {
    await extract({
      file: archivePath,
      cwd: tempDir,
      gzip: true,
    });

    console.log('Building ExifTool...');
    execSync('perl Makefile.PL', { cwd: extractedPath });
    execSync('make', { cwd: extractedPath });

    console.log('Cleaning up build...');
    distPath = path.join(extractedPath, 'blib');
    await fs.rename(
      path.join(distPath, 'script', 'exiftool'),
      path.join(distPath, 'exiftool'),
    );

    for (const subdir of ['arch', 'bin', 'man1', 'man3', 'script']) {
      await fs.rm(path.join(distPath, subdir), {
        recursive: true,
        force: true,
      });
    }
  }

  console.log('Putting ExifTool dist in project...');
  const targetDir = path.join('src-tauri', 'resources');
  await fs.mkdir(targetDir, { recursive: true });
  await fs.rename(distPath, path.join(targetDir, 'exiftool'));
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await fs.rm(tempDir, { recursive: true, force: true });
}

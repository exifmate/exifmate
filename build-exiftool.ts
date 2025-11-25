import { execSync } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { extract } from 'tar';

const exiftoolName = 'Image-ExifTool-13.38';
const downloadFileName = `${exiftoolName}.tar.gz`;
const downloadUrl = `https://sourceforge.net/projects/exiftool/files/${downloadFileName}`;

console.log(`Let's get ${exiftoolName}`);

console.log('Downloading...');
const res = await fetch(downloadUrl);
if (!res.ok || res.body === null) {
  throw new Error('Failed to download');
}

const tempDir = await fs.mkdtemp(tmpdir());
const tarballPath = path.join(tempDir, downloadFileName);

try {
  const nodeStream = Readable.from(res.body);
  const fileStream = createWriteStream(tarballPath);

  await new Promise<void>((resolve, reject) => {
    nodeStream.pipe(fileStream);
    nodeStream.on('error', reject);
    fileStream.on('finish', resolve);
  });

  console.log('Extracting...');
  await extract({
    file: tarballPath,
    cwd: tempDir,
    gzip: true,
  });

  const extractedPath = path.join(tempDir, exiftoolName);

  console.log('Building ExifTool...');
  execSync('perl Makefile.PL', { cwd: extractedPath });
  execSync('make', { cwd: extractedPath });

  console.log('Cleaning up build...');
  const distPath = path.join(extractedPath, 'blib');
  await fs.rename(
    path.join(distPath, 'script', 'exiftool'),
    path.join(distPath, 'exiftool'),
  );

  await fs.rm(path.join(distPath, 'arch'), { recursive: true, force: true });
  await fs.rm(path.join(distPath, 'bin'), { recursive: true, force: true });
  await fs.rm(path.join(distPath, 'man1'), { recursive: true, force: true });
  await fs.rm(path.join(distPath, 'man3'), { recursive: true, force: true });
  await fs.rm(path.join(distPath, 'script'), { recursive: true, force: true });

  console.log('Putting ExifTool dist in project...');
  const targetDir = path.join('src-tauri', 'resources');
  await fs.mkdir(targetDir, { recursive: true });
  await fs.rename(distPath, path.join(targetDir, 'exiftool'));
} catch (err) {
  console.error('Something went wrong');
  console.error(err);
} finally {
  await fs.rm(tempDir, { recursive: true, force: true });
}

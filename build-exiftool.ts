import { execSync } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import { platform, tmpdir } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { extract } from 'tar';
import unzipper from 'unzipper';

const onWindows = platform() === 'win32';

let exiftoolName: string;
let downloadFileName: string;
if (onWindows) {
  exiftoolName = 'exiftool-13.50_64';
  downloadFileName = `${exiftoolName}.zip`;
} else {
  exiftoolName = 'Image-ExifTool-13.50';
  downloadFileName = `${exiftoolName}.tar.gz`;
}
const downloadUrl = `https://sourceforge.net/projects/exiftool/files/${downloadFileName}`;

console.log(`Let's get ${exiftoolName}`);

console.log('Downloading...');
const res = await fetch(downloadUrl);
if (!res.ok || res.body === null) {
  throw new Error('Failed to download');
}

const tempDir = process.env.RUNNER_TEMP ?? (await fs.mkdtemp(tmpdir()));
const archivePath = path.join(tempDir, downloadFileName);

try {
  const nodeStream = Readable.from(res.body);
  const fileStream = createWriteStream(archivePath);

  await new Promise<void>((resolve, reject) => {
    nodeStream.pipe(fileStream);
    nodeStream.on('error', reject);
    fileStream.on('finish', resolve);
  });

  console.log('Extracting...');

  const extractedPath = path.join(tempDir, exiftoolName);
  let distPath: string;

  if (onWindows) {
    const zipDir = await unzipper.Open.file(archivePath);
    await zipDir.extract({ path: tempDir });
    distPath = path.join(extractedPath);

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

    await fs.rm(path.join(distPath, 'arch'), { recursive: true, force: true });
    await fs.rm(path.join(distPath, 'bin'), { recursive: true, force: true });
    await fs.rm(path.join(distPath, 'man1'), { recursive: true, force: true });
    await fs.rm(path.join(distPath, 'man3'), { recursive: true, force: true });
    await fs.rm(path.join(distPath, 'script'), {
      recursive: true,
      force: true,
    });
  }

  console.log('Putting ExifTool dist in project...');
  const targetDir = path.join('src-tauri', 'resources');
  await fs.mkdir(targetDir, { recursive: true });
  await fs.rename(distPath, path.join(targetDir, 'exiftool'));
} catch (err) {
  console.error('Something went wrong');
  console.error(err);
  process.exitCode = 1;
} finally {
  await fs.rm(tempDir, { recursive: true, force: true });
}

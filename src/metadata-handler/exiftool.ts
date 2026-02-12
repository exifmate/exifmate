import { loadSettings } from '@platform/settings';
import { Command } from '@tauri-apps/plugin-shell';

async function additionalFlags() {
  const settings = await loadSettings();
  const flags: string[] = [];

  if (settings.originalFileBehavior === 'overwrite_original') {
    flags.push('-overwrite_original');
  } else if (settings.originalFileBehavior === 'overwrite_original_in_place') {
    flags.push('-overwrite_original_in_place');
  }

  return flags;
}

export async function execute(args: string[]) {
  const res = await Command.create('exiftool', [
    '-q',
    ...(await additionalFlags()),
    ...args,
  ]).execute();

  if (res.stderr || res.code !== 0) {
    throw new Error(res.stderr);
  }

  return res.stdout;
}

export async function exiftoolVersion() {
  const res = await Command.create('exiftool', ['-ver']).execute();

  if (res.stderr || res.code !== 0) {
    throw new Error(res.stderr);
  }

  return res.stdout.trim();
}

export async function perlVersion() {
  const res = await Command.create('perl-version', [
    '-e',
    'print "$^V\n"',
  ]).execute();

  if (res.stderr || res.code !== 0) {
    throw new Error(res.stderr);
  }

  return res.stdout.trim();
}

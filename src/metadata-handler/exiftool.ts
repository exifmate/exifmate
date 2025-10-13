import { loadSettings } from '@app/platform/settings';
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

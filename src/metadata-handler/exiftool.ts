import { Command } from '@tauri-apps/plugin-shell';

export async function execute(args: string[]) {
  const res = await Command.create(
    'exiftool',
    [
      '-q',
      ...args,
    ],
  ).execute();

  if (res.stderr || res.code !== 0) {
    throw new Error(res.stderr);
  }

  return res.stdout
}

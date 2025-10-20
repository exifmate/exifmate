import { load } from '@tauri-apps/plugin-store';
import { z } from 'zod';

export const Settings = z.object({
  originalFileBehavior: z
    .enum([
      'copy_original',
      'overwrite_original',
      'overwrite_original_in_place',
    ])
    .optional(),
});

export type Settings = z.infer<typeof Settings>;

export async function loadSettings() {
  const store = await load('settings.json');
  const savedSettings = Object.fromEntries(await store.entries());
  return Settings.parseAsync(savedSettings);
}

export async function saveSettings(newSettings: Partial<Settings>) {
  const store = await load('settings.json');

  for (const setting in newSettings) {
    await store.set(setting, newSettings[setting as keyof Settings]);
  }
}

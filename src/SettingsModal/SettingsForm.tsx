import Fieldset from '@app/components/Fieldset';
import { showToast } from '@app/Toasts/toast-queue';
import { zodResolver } from '@hookform/resolvers/zod';
import { load } from '@tauri-apps/plugin-store';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';

const Settings = z.object({
  originalFileBehavior: z
    .enum([
      'copy_original',
      'overwrite_original',
      'overwrite_original_in_place',
    ])
    .optional(),
});

type Settings = z.infer<typeof Settings>;

interface Props {
  onSubmit: () => void;
  children: ReactNode;
}

function SettingsForm({ onSubmit, children }: Props) {
  const { register, handleSubmit } = useForm<Settings>({
    resolver: zodResolver(Settings),
    async defaultValues() {
      try {
        const store = await load('settings.json');
        const savedSettings = Object.fromEntries(await store.entries());
        return Settings.parseAsync(savedSettings);
      } catch (err) {
        console.error('Failed to load settings:', err);
        await showToast({ message: 'Failed to load settings', level: 'error' });
        throw err;
      }
    },
  });

  return (
    <form
      id="settings-form"
      onSubmit={handleSubmit(async (newValue) => {
        const store = await load('settings.json');

        for (const setting in newValue) {
          await store.set(setting, newValue[setting as keyof Settings]);
        }

        await showToast({ message: 'Settings Saved', level: 'success' });
        onSubmit();
      })}
    >
      <Fieldset legend="Original File Behavior">
        <label className="label items-start text-wrap">
          <input
            {...register('originalFileBehavior')}
            type="radio"
            className="radio"
            value="copy_original"
          />

          <div>
            <p className="font-bold">Copy Original File (default)</p>

            <p>
              Causes each <samp>FILE</samp> to be rewritten, and the original
              files are preserved with <samp>_original</samp> appended to their
              names.
            </p>
          </div>
        </label>

        <label className="label items-start text-wrap">
          <input
            {...register('originalFileBehavior')}
            type="radio"
            className="radio"
            value="overwrite_original"
          />

          <div>
            <p className="font-bold">Overwrite Original File</p>
            <p>
              Overwrite the original <samp>FILE</samp> (instead of preserving it
              by adding <samp>_original</samp> to the file name) when writing
              information to an image.
            </p>
          </div>
        </label>

        <label className="label items-start text-wrap">
          <input
            {...register('originalFileBehavior')}
            type="radio"
            className="radio"
            value="overwrite_original_in_place"
          />

          <div>
            <p className="font-bold">Overwrite Original File In Place</p>
            <p>
              Similar to <samp>Overwrite Original</samp> except that the
              original file attributes to be preserved. For example, on a Mac
              this causes the original file creation date, ownership, type,
              creator, label color and icon to be preserved. Has slightly slower
              performance.
            </p>
          </div>
        </label>
      </Fieldset>

      {children}
    </form>
  );
}

export default SettingsForm;

import Fieldset from '@app/components/Fieldset';
import { loadSettings, Settings, saveSettings } from '@app/platform/settings';
import { showToast } from '@app/Toasts/toast-queue';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';

interface Props {
  onSubmit: () => void;
  children: ReactNode;
}

function SettingsForm({ onSubmit, children }: Props) {
  const { register, handleSubmit } = useForm<Settings>({
    resolver: zodResolver(Settings),
    async defaultValues() {
      try {
        return loadSettings();
      } catch (err) {
        console.error('Failed to load settings:', err);
        await showToast({ message: 'Failed to load settings', level: 'error' });
        throw err;
      }
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (newSettings) => {
        await saveSettings(newSettings);
        await showToast({
          message: 'Settings Saved',
          level: 'success',
          timeout: 3_000,
        });
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

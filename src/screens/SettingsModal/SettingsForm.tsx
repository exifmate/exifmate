import {
  Button,
  Description,
  Label,
  Modal,
  Radio,
  RadioGroup,
  Spinner,
  toast,
} from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { loadSettings, Settings, saveSettings } from '@platform/settings';
import { Controller, useForm } from 'react-hook-form';
import useSWR from 'swr';

const copyOriginal =
  'Saves to a copy of the FILE, \
with the original file having `_original` appended to the file name \
(if there is already a `{FILE}_original` file, that file is not replaced).';

const overwriteOriginal =
  'Overwrite the original FILE (instead of \
preserving it by adding `_original` to the file name) when writing information to an image';

const overwriteOriginalInPlace =
  'Similar to `Overwrite Original` except that the \
original file attributes to be preserved. For example, on a Mac this causes the original \
file creation date, ownership, type, creator, label color and icon to be preserved. \
Has slightly slower performance.';

interface Props {
  onClose: () => void;
}

function SettingsForm({ onClose }: Props) {
  const res = useSWR('settings', loadSettings, {
    revalidateOnFocus: false,
    onError(err) {
      console.error('Failed to load settings:', err);
      toast.danger('Failed to load settings');
    },
  });

  const {
    handleSubmit,
    control,
    formState: { disabled, isSubmitting },
  } = useForm<Settings>({
    resolver: zodResolver(Settings),
    values: res.data,
    disabled: res.isLoading,
  });

  return (
    <Modal.Dialog>
      <Modal.CloseTrigger />
      <Modal.Header>
        <Modal.Heading>Settings</Modal.Heading>
      </Modal.Header>

      <Modal.Body>
        <form
          id="settings-form"
          onSubmit={handleSubmit(async (newSettings) => {
            try {
              await saveSettings(newSettings);
              await res.mutate(newSettings);
              toast.success('Settings Saved', { timeout: 3_000 });
              onClose();
            } catch (err) {
              console.error('Failed to save settings:', err);
              toast.danger('Failed to save settings');
            }
          })}
        >
          <Controller
            name="originalFileBehavior"
            control={control}
            render={({ field: { disabled, value, ...field } }) => {
              return (
                <RadioGroup
                  {...field}
                  isDisabled={disabled}
                  value={value ?? null}
                >
                  <Label>Original File Behavior</Label>

                  <Radio value="copy_original">
                    <Radio.Control>
                      <Radio.Indicator />
                    </Radio.Control>
                    <Radio.Content>
                      <Label>Copy Original File (default)</Label>
                      <Description>{copyOriginal}</Description>
                    </Radio.Content>
                  </Radio>
                  <Radio value="overwrite_original">
                    <Radio.Control>
                      <Radio.Indicator />
                    </Radio.Control>
                    <Radio.Content>
                      <Label>Overwrite Original File</Label>
                      <Description>{overwriteOriginal}</Description>
                    </Radio.Content>
                  </Radio>
                  <Radio value="overwrite_original_in_place">
                    <Radio.Control>
                      <Radio.Indicator />
                    </Radio.Control>
                    <Radio.Content>
                      <Label>Overwrite Original File In Place</Label>
                      <Description>{overwriteOriginalInPlace}</Description>
                    </Radio.Content>
                  </Radio>
                </RadioGroup>
              );
            }}
          />
        </form>
      </Modal.Body>

      <Modal.Footer>
        <Button slot="close" variant="secondary" onPress={onClose}>Cancel</Button>
        <Button
          form="settings-form"
          type="submit"
          isPending={isSubmitting || res.isLoading}
          isDisabled={disabled}
        >
          {({ isPending }) => (
            <>
              {isPending && <Spinner color="current" size="sm" />}
              Save
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal.Dialog>
  );
}

export default SettingsForm;

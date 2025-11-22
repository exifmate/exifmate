import {
  addToast,
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
} from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { loadSettings, Settings, saveSettings } from '@platform/settings';
import { Controller, useForm } from 'react-hook-form';
import useSWR from 'swr';

const copyOriginal =
  'Saves to a copy of the FILE,\
with the original file having `_original` appended to the file name\
(if there is already a `{FILE}_original` file, it is not replaced).';

const overwriteOriginal =
  'Overwrite the original FILE (instead of\
preserving it by adding `_original` to the file name) when writing information to an image';

const overwriteOriginalInPlace =
  'Similar to `Overwrite Original` except that the\
original file attributes to be preserved. For example, on a Mac this causes the original\
file creation date, ownership, type, creator, label color and icon to be preserved.\
Has slightly slower performance.';

interface Props {
  onClose: () => void;
}

function SettingsForm({ onClose }: Props) {
  const res = useSWR('settings', loadSettings, {
    revalidateOnFocus: false,
    onError(err) {
      console.error('Failed to load settings:', err);
      addToast({ color: 'danger', title: 'Failed to load settings' });
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
    <>
      <ModalHeader>Settings</ModalHeader>
      <ModalBody>
        <form
          id="settings-form"
          onSubmit={handleSubmit(async (newSettings) => {
            try {
              await saveSettings(newSettings);
              await res.mutate(newSettings);
              addToast({
                color: 'success',
                timeout: 3_000,
                title: 'Settings Saved',
              });
              onClose();
            } catch (err) {
              console.error('Failed to save settings:', err);
              addToast({ color: 'danger', title: 'Failed to save settings' });
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
                  label="Original File Behavior"
                  isDisabled={disabled}
                  value={value ?? null}
                >
                  <Radio value="copy_original" description={copyOriginal}>
                    Copy Original File (default)
                  </Radio>
                  <Radio
                    value="overwrite_original"
                    description={overwriteOriginal}
                  >
                    Overwrite Original File
                  </Radio>
                  <Radio
                    value="overwrite_original_in_place"
                    description={overwriteOriginalInPlace}
                  >
                    Overwrite Original File In Place
                  </Radio>
                </RadioGroup>
              );
            }}
          />
        </form>
      </ModalBody>

      <ModalFooter>
        <Button onPress={onClose}>Cancel</Button>
        <Button
          form="settings-form"
          type="submit"
          color="primary"
          isLoading={isSubmitting || res.isLoading}
          isDisabled={disabled}
        >
          Save
        </Button>
      </ModalFooter>
    </>
  );
}

export default SettingsForm;

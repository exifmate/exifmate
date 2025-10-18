import Tabs from '@components/Tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExifData } from '@metadata-handler/exifdata';
import { readMetadata } from '@metadata-handler/read';
import { updateMetadata } from '@metadata-handler/update';
import {
  onSaveAction,
  setEditMenuEnabled,
  setSaveMenuItemEnabled,
} from '@platform/app-menu';
import type { ImageInfo } from '@platform/file-manager';
import { showToast } from '@screens/Toasts/toast-queue';
import type { UnlistenFn } from '@tauri-apps/api/event';
import { use, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Item } from 'react-stately';
import ExifTab from './ExifTab';
import LocationTab from './LocationTab';

function usePlatformIntegration(badState: boolean, formDisabled: boolean) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setSaveMenuItemEnabled(!badState);
  }, [badState]);

  useEffect(() => {
    setEditMenuEnabled(!formDisabled);
  }, [formDisabled]);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    onSaveAction(() => {
      formRef.current?.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true }),
      );
    }).then((u) => {
      unlisten = u;
    });

    return () => {
      unlisten?.();
    };
  }, []);

  return { formRef };
}

interface MetadataFormProps {
  exifDataPromise: ReturnType<typeof readMetadata>;
  selectedImages: ImageInfo[];
}

function ExifForm({ exifDataPromise, selectedImages }: MetadataFormProps) {
  const exifData = use(exifDataPromise);
  const [activeTab, setActiveTab] = useState<'EXIF' | 'Location'>('EXIF');

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const form = useForm({
    disabled: !isEditing,
    resolver: zodResolver(ExifData),
    reValidateMode: 'onChange',
    async defaultValues() {
      return exifData;
    },
  });

  const badState =
    !form.formState.isDirty ||
    !form.formState.isValid ||
    form.formState.disabled ||
    form.formState.isSubmitting;

  const { formRef } = usePlatformIntegration(badState, form.formState.disabled);

  useEffect(() => {
    if (selectedImages) {
      setIsEditing(false);
    }
  }, [selectedImages]);

  const onSubmit = async (newExif: ExifData) => {
    try {
      await updateMetadata(selectedImages, newExif);
    } catch (err) {
      console.error('Failed saving:', err);
      await showToast({
        level: 'error',
        message: 'Failed to save images',
      });

      return;
    }

    try {
      const actualData = await readMetadata(selectedImages);
      form.reset({ ...actualData });
    } catch (err) {
      console.error('Failed refreshing metadata:', err);
      await showToast({
        level: 'warning',
        message: 'Failed refreshing metadata after saving',
      });
    }

    setIsEditing(false);
    await showToast({
      level: 'success',
      timeout: 3_000,
      message: 'Saved Metadata!',
    });
  };

  return (
    <FormProvider {...form}>
      <form
        ref={formRef}
        className="grow flex flex-1 flex-col overflow-clip"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Tabs
          aria-label="Editor Tabs"
          selectedKey={activeTab}
          onSelectionChange={(k) => setActiveTab(k as 'EXIF' | 'Location')}
        >
          <Item key="EXIF" title="EXIF">
            <ExifTab />
          </Item>
          <Item key="Location" title="Location">
            <LocationTab />
          </Item>
        </Tabs>

        <div className="bg-base-200 z-10 px-4 py-2 flex justify-between">
          {!isEditing ? (
            <button
              type="button"
              className="btn btn-soft btn-sm btn-accent"
              disabled={form.formState.isSubmitting}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-soft btn-sm btn-secondary"
                disabled={form.formState.isSubmitting}
                onClick={() => {
                  setIsEditing(false);
                  form.reset();
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-soft btn-sm btn-primary"
                disabled={badState}
              >
                {form.formState.isSubmitting && (
                  <span className="loading loading-spinner loading-sm"></span>
                )}
                Save
              </button>
            </>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

export default ExifForm;

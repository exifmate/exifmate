import Center from '@components/Center';
import Tabs from '@components/Tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import useTauriListener from '@hooks/useTauriListener';
import { ExifData } from '@metadata-handler/exifdata';
import { readMetadata } from '@metadata-handler/read';
import { updateMetadata } from '@metadata-handler/update';
import {
  ENTER_METADATA_EDIT_EVENT,
  SAVE_METADATA_EVENT,
  setEditMenuEnabled,
  setEditMenuImagesPluralize,
  setSaveMenuItemEnabled,
  setToolsMenuEnabled,
} from '@platform/app-menu';
import type { ImageInfo } from '@platform/file-manager';
import { showToast } from '@screens/Toasts/toast-queue';
import { useEffect, useRef, useState } from 'react';
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

  useTauriListener(SAVE_METADATA_EVENT, () => {
    formRef.current?.dispatchEvent(
      new Event('submit', { cancelable: true, bubbles: true }),
    );
  });

  return { formRef };
}

type ExifDataRes =
  | {
      state: 'loading' | 'failed';
    }
  | {
      state: 'resolved';
      data: ExifData;
    };

interface Props {
  selectedImages: ImageInfo[];
}

function MetadataEditorPanel({ selectedImages }: Props) {
  const [activeTab, setActiveTab] = useState<'EXIF' | 'Location'>('EXIF');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [exifDataRes, setExifDataRes] = useState<ExifDataRes>({
    state: 'loading',
  });

  const form = useForm({
    disabled: !isEditing,
    resolver: zodResolver(ExifData),
    mode: 'onChange',
    values: exifDataRes.state === 'resolved' ? exifDataRes.data : {},
  });

  const badState =
    !form.formState.isDirty ||
    !form.formState.isValid ||
    form.formState.disabled ||
    form.formState.isSubmitting;

  const { formRef } = usePlatformIntegration(badState, form.formState.disabled);

  useEffect(() => {
    if (selectedImages.length === 0) {
      return;
    }

    setExifDataRes({ state: 'loading' });

    readMetadata(selectedImages)
      .then((data) => setExifDataRes({ data, state: 'resolved' }))
      .catch((err) => {
        console.error('Failed reading metadata for selection:', err);
        setExifDataRes({ state: 'failed' });
      });
  }, [selectedImages]);

  useEffect(() => {
    if (selectedImages) {
      setIsEditing(false);
    }
  }, [selectedImages]);

  useEffect(() => {
    if (selectedImages.length) {
      setToolsMenuEnabled(true);
    } else {
      setToolsMenuEnabled(false);
    }

    setEditMenuImagesPluralize(selectedImages.length !== 1);
  }, [selectedImages.length]);

  useTauriListener(ENTER_METADATA_EDIT_EVENT, () => {
    setIsEditing(true);
  });

  const onSubmit = async (newExif: ExifData) => {
    try {
      await updateMetadata(selectedImages, newExif);
    } catch (err) {
      console.error('Failed saving:', err);
      showToast({
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
      showToast({
        level: 'warning',
        message: 'Failed refreshing metadata after saving',
      });
    }

    setIsEditing(false);
    showToast({
      level: 'success',
      timeout: 3_000,
      message: 'Saved Metadata!',
    });
  };

  if (selectedImages.length === 0) {
    return (
      <Center>
        <p className="text-lg">No Image Selected</p>
      </Center>
    );
  }

  if (exifDataRes.state === 'loading') {
    return (
      <Center>
        <div className="loading loading-xl text-accent motion-reduce:hidden"></div>
        <p className="text-lg">Loading Metadata...</p>
      </Center>
    );
  }

  if (exifDataRes.state === 'failed') {
    return (
      <Center>
        <div role="alert" className="alert alert-error alert-soft">
          Error Loading Metadata
        </div>
      </Center>
    );
  }

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

export default MetadataEditorPanel;

import Tabs from '@app/components/Tabs';
import LocationTab from '@app/LocationTab/LocationTab';
import { ExifData } from '@app/metadata-handler/exifdata';
import { onSaveAction, saveMenuItem } from '@app/platform/app-menu';
import type { ImageInfo } from '@app/platform/file-manager';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UnlistenFn } from '@tauri-apps/api/event';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Item } from 'react-stately';
import Center from '../components/Center';
import ExifTab from './ExifTab';
import useExif from './useExif';

interface Props {
  selectedImages: ImageInfo[];
}

function MetadataEditor({ selectedImages }: Props) {
  const [activeTab, setActiveTab] = useState<'EXIF' | 'Location'>('EXIF');
  const { loadingStatus, exif, saveMetadata } = useExif(selectedImages);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm({
    disabled: !isEditing,
    resolver: zodResolver(ExifData),
    reValidateMode: 'onChange',
  });

  const badState = !form.formState.isDirty ||
    !form.formState.isValid ||
    form.formState.disabled ||
    form.formState.isSubmitting

  useEffect(() => {
    if (badState) {
      saveMenuItem.setEnabled(false);
    } else {
      saveMenuItem.setEnabled(true);
    }
  }, [badState]);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    onSaveAction(() => {
      formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }).then((u) => {
      unlisten = u;
    });

    return () => {
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    if (exif) {
      form.reset(exif);
      form.trigger();
    }
  }, [exif, form.reset, form.trigger]);

  useEffect(() => {
    if (selectedImages) {
      setIsEditing(false);
    }
  }, [selectedImages]);

  if (selectedImages.length === 0) {
    return (
      <Center>
        <p className="text-lg">No Image Selected</p>
      </Center>
    );
  }

  if (loadingStatus === 'active') {
    return (
      <Center>
        <div className="loading loading-xl text-accent motion-reduce:hidden"></div>
        <p className="text-lg">Loading Metadata...</p>
      </Center>
    );
  }

  if (loadingStatus === 'errored') {
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
        onSubmit={form.handleSubmit(async (newExif: ExifData) => {
          await saveMetadata(newExif);
          setIsEditing(false);
        })}
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

export default MetadataEditor;

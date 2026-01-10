import Center from '@components/Center';
import { Alert, addToast, Button, Spinner, Tab, Tabs } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import useTauriListener from '@hooks/useTauriListener';
import { defaultExifData, ExifData } from '@metadata-handler/exifdata';
import { readMetadata } from '@metadata-handler/read';
import { updateMetadata } from '@metadata-handler/update';
import type { ImageInfo } from '@platform/file-manager';
import EditMenu from '@platform/menus/edit-menu';
import FileMenu, { SAVE_METADATA_EVENT } from '@platform/menus/file-menu';
import ToolsMenu, {
  ENTER_METADATA_EDIT_EVENT,
  updateEditImagesLabel,
} from '@platform/menus/tools-menu';
import type { MenuItem } from '@tauri-apps/api/menu';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import useSWR from 'swr';
import ExifTab from './ExifTab';
import LocationTab from './LocationTab';

interface Props {
  selectedImages: ImageInfo[];
}

function MetadataEditorPanel({ selectedImages }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [activeTab, setActiveTab] = useState<'EXIF' | 'Location'>('EXIF');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const exifDataRes = useSWR(selectedImages, readMetadata, {
    revalidateOnFocus: false,
    onError(err) {
      console.error('Failed reading metadata for selection:', err);
    },
  });

  const form = useForm({
    disabled: !isEditing,
    resolver: zodResolver(ExifData),
    mode: 'onChange',
    defaultValues: defaultExifData,
    // Need to spread a default with null values because if they're `undefined`
    // react-hook-form doesn't actually clear the values.
    values: { ...defaultExifData, ...exifDataRes.data },
  });

  // `isValid` needs to be evaluated early or else `badState` can have a false positive
  // (selecting an image for the first time needs 3+ changes before being valid otherwise)
  const { isDirty, isValid, isSubmitting, disabled } = form.formState;
  const badState = !isDirty || !isValid || disabled || isSubmitting;

  useEffect(() => {
    if (selectedImages) {
      setIsEditing(false);
    }
  }, [selectedImages]);

  useEffect(() => {
    const toolsMenuEnabled = selectedImages.length !== 0;
    ToolsMenu.setEnabled(toolsMenuEnabled).catch((err) => {
      console.error(
        `Failed ${toolsMenuEnabled ? 'enabling' : 'disabling'} tools menu:`,
        err,
      );
    });

    const pluralizeImages = selectedImages.length !== 1;
    updateEditImagesLabel(pluralizeImages).catch((err) => {
      console.error(
        `Failed to ${pluralizeImages ? 'pluralize' : 'singularize'} menu item label:`,
        err,
      );
    });
  }, [selectedImages.length]);

  useTauriListener(ENTER_METADATA_EDIT_EVENT, () => {
    setIsEditing(true);
  });

  useEffect(() => {
    FileMenu.get('save')
      .then((item) => (item as MenuItem).setEnabled(!badState))
      .catch((err) => {
        console.error(
          `Failed to ${!badState ? 'disable' : 'enable'} save menu:`,
          err,
        );
      });
  }, [badState]);

  useEffect(() => {
    EditMenu.setEnabled(!disabled).catch((err) => {
      console.error(
        `Failed to ${!disabled ? 'disable' : 'enable'} edit menu:`,
        err,
      );
    });
  }, [disabled]);

  useTauriListener(SAVE_METADATA_EVENT, () => {
    formRef.current?.dispatchEvent(
      new Event('submit', { cancelable: true, bubbles: true }),
    );
  });

  const onSubmit = async (formValue: ExifData) => {
    const newExif: ExifData = {};

    // Prevent `null` values for clean fields getting saved.
    // Which is to say this makes it so when editing multiple files, unchanged
    // but different fields don't get removed.
    // However, this doesn't cover if a field is empty (different values across files)
    // and the user adds a value but removes it.
    for (const [key, value] of Object.entries(formValue)) {
      if (form.formState.dirtyFields[key as keyof ExifData]) {
        // @ts-expect-error
        newExif[key as keyof ExifData] = value;
      }
    }

    try {
      await updateMetadata(selectedImages, newExif);
    } catch (err) {
      console.error('Failed saving:', newExif);
      console.error(err);
      addToast({
        color: 'danger',
        title: 'Failed to save images',
      });

      return;
    }

    await exifDataRes.mutate();

    setIsEditing(false);
    addToast({
      color: 'success',
      timeout: 3_000,
      title: 'Saved Metadata!',
    });
  };

  if (selectedImages.length === 0) {
    return (
      <Center>
        <p className="text-large">No Image Selected</p>
      </Center>
    );
  }

  if (exifDataRes.isLoading) {
    return (
      <Center>
        <Spinner color="secondary" />
        <p className="text-large">Loading Metadata...</p>
      </Center>
    );
  }

  if (exifDataRes.error) {
    return (
      <Center>
        <div>
          <Alert color="danger" title="Error Loading Metadata" />
        </div>
      </Center>
    );
  }

  return (
    <FormProvider {...form}>
      <form
        ref={formRef}
        className="h-full flex flex-col overflow-clip"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Tabs
          aria-label="Editor Tabs"
          selectedKey={activeTab}
          onSelectionChange={(k) => setActiveTab(k as 'EXIF' | 'Location')}
          classNames={{
            base: 'px-2 pt-2',
            tabList: 'w-full',
            panel: 'overflow-auto grow px-3',
          }}
        >
          <Tab key="EXIF" title="EXIF">
            <ExifTab />
          </Tab>
          <Tab key="Location" title="Location">
            <LocationTab />
          </Tab>
        </Tabs>

        <div className="flex px-4 py-2 justify-between">
          {!isEditing ? (
            <Button
              color="secondary"
              isDisabled={isSubmitting}
              onPress={() => setIsEditing(true)}
            >
              Edit
            </Button>
          ) : (
            <>
              <Button
                isDisabled={isSubmitting}
                onPress={() => {
                  setIsEditing(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                color="primary"
                isDisabled={badState}
                isLoading={isSubmitting}
              >
                Save
              </Button>
            </>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

export default MetadataEditorPanel;

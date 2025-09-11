import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Center from '../components/Center';
import { type ExifData, exifData } from '../core/types';
import { useImageSelection } from '../ImageContext';
import LocationTab from '../LocationTab/LocationTab';
import ExifTab from './ExifTab';
import useExif from './useExif';

function MetadataEditor() {
  const { selectedImages } = useImageSelection();
  const [activeTab, setActiveTab] = useState<'EXIF' | 'Location'>('EXIF');
  const { loadingStatus, exif, saveMetadata } = useExif(selectedImages);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const form = useForm({
    mode: 'onChange',
    disabled: !isEditing,
    resolver: zodResolver(exifData),
  });

  useEffect(() => {
    if (exif) {
      form.reset(exif);
    }
  }, [exif, form.reset]);

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
    <div className="h-full">
      <FormProvider {...form}>
        <form
          className="flex flex-col h-full"
          onSubmit={form.handleSubmit(async (newExif: ExifData) => {
            await saveMetadata(newExif);
            setIsEditing(false);
          })}
        >
          <div role="tablist" className="tabs tabs-lift bg-base-200 px-4 pt-2">
            {(['EXIF', 'Location'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                id={`${tab}-tab`}
                aria-controls={`${tab}-pane`}
                aria-selected={tab === activeTab}
                className={classNames('tab', {
                  'tab-active': tab === activeTab,
                })}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="px-2 pb-3 grow overflow-auto">
            <div
              id="EXIF-pane"
              role="tabpanel"
              aria-labelledby="EXIF-tab"
              hidden={activeTab !== 'EXIF'}
              className={classNames({ hidden: activeTab !== 'EXIF' })}
            >
              <ExifTab />
            </div>

            <div
              id="Location-pane"
              role="tabpanel"
              aria-labelledby="Location-tab"
              hidden={activeTab !== 'Location'}
              className={classNames('h-full pt-3', {
                hidden: activeTab !== 'Location',
              })}
            >
              <LocationTab />
            </div>
          </div>

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
                  disabled={
                    !form.formState.isValid || form.formState.isSubmitting
                  }
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
    </div>
  );
}

export default MetadataEditor;

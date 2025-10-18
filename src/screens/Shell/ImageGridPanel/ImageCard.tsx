import type { ImageInfo } from '@platform/file-manager';
import { readFile } from '@tauri-apps/plugin-fs';
import { Suspense, use } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { MdWarning } from 'react-icons/md';

async function loadThumbnail(path: string) {
  try {
    const data = await readFile(path);
    const assetUrl = URL.createObjectURL(new Blob([data.buffer]));
    return assetUrl;
  } catch (err) {
    console.error('Failed to load thumbnail:', err);
    throw err;
  }
}

interface ThumbnailProps {
  loadThumbnailPromise: ReturnType<typeof loadThumbnail>;
  filename: string;
}

function Thumbnail({ loadThumbnailPromise, filename }: ThumbnailProps) {
  const thumbnailUrl = use(loadThumbnailPromise);

  return (
    <img
      src={thumbnailUrl}
      alt={`${filename} thumbnail`}
      className="h-56 object-cover"
      height={288}
      width={288}
    />
  );
}

function ImageCard({ path, filename }: ImageInfo) {
  return (
    <div className="card card-xs w-56 bg-neutral cursor-pointer">
      <ErrorBoundary
        fallback={
          <div className="h-56 w-56 flex justify-center items-center">
            <MdWarning size={40} title="Failed to load thumbnail" />
          </div>
        }
      >
        <Suspense fallback={<div className="skeleton h-56 w-56" />}>
          <Thumbnail
            filename={filename}
            loadThumbnailPromise={loadThumbnail(path)}
          />
        </Suspense>
      </ErrorBoundary>

      <div className="card-body">
        <div className="card-title">{filename}</div>
      </div>
    </div>
  );
}

export default ImageCard;

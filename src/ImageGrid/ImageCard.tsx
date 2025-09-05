import { readFile } from '@tauri-apps/plugin-fs';
import { useEffect, useState } from 'react';
import type { ImageInfo } from '../core/types';

function ImageCard({ path, filename }: ImageInfo) {
  const [assetUrl, setAssetUrl] = useState<string>();

  useEffect(() => {
    readFile(path)
      .then((data) => {
        const url = URL.createObjectURL(new Blob([data.buffer]));
        setAssetUrl(url);
      })
      .catch((err) => {
        // TODO: should probably have a generic image to show it's errored
        console.error('Failed to load image', err);
      });
  }, [path]);

  return (
    <div className="card card-xs w-56 bg-neutral">
      {assetUrl ? (
        <figure>
          <img
            src={assetUrl}
            alt={`${filename} thumbnail`}
            className="h-56 w-56 object-cover"
            height={288}
            width={288}
          />
        </figure>
      ) : (
        <div className="skeleton h-56 w-56"></div>
      )}

      <div className="card-body">
        <div className="card-title">{filename}</div>
      </div>
    </div>
  );
}

export default ImageCard;

import { convertFileSrc } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';
import type { ImageInfo } from '../core/types';

function ImageCard({ path, filename }: ImageInfo) {
  const [assetUrl, setAssetUrl] = useState<string>();

  useEffect(() => {
    setAssetUrl(convertFileSrc(path));
  }, [path]);

  return (
    <div className="card card-xs w-56 bg-neutral">
      <figure>
        <img
          src={assetUrl}
          alt={`${filename} thumbnail`}
          className="h-56 w-56 object-cover"
          height={288}
          width={288}
        />
      </figure>

      <div className="card-body">
        <div className="card-title">{filename}</div>
      </div>
    </div>
  );
}

export default ImageCard;

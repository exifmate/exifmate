import type { ImageInfo } from '@app/platform/file-manager';
import { readFile } from '@tauri-apps/plugin-fs';
import { useEffect, useState } from 'react';
import { MdWarning } from 'react-icons/md';

type ThumbnailState =
  | {
      state: 'loading' | 'failed';
    }
  | {
      state: 'resolved';
      assetUrl: string;
    };

function ImageCard({ path, filename }: ImageInfo) {
  const [thumbnail, setThumbnail] = useState<ThumbnailState>({
    state: 'loading',
  });

  useEffect(() => {
    setThumbnail({ state: 'loading' });

    readFile(path)
      .then((data) => {
        const assetUrl = URL.createObjectURL(new Blob([data.buffer]));
        setThumbnail({ assetUrl, state: 'resolved' });
      })
      .catch((err) => {
        setThumbnail({ state: 'failed' });
        console.error('Failed to load thumbnail:', err);
      });
  }, [path]);

  return (
    <div className="card card-xs w-56 bg-neutral">
      {thumbnail.state === 'loading' ? (
        <div className="skeleton h-56 w-56"></div>
      ) : (
        <figure className="h-56 bg-base-200">
          {thumbnail.state === 'resolved' ? (
            <img
              src={thumbnail.assetUrl}
              alt={`${filename} thumbnail`}
              className="h-56 object-cover"
              height={288}
              width={288}
            />
          ) : (
            <MdWarning size={40} title="Failed to load thumbnail" />
          )}
        </figure>
      )}

      <div className="card-body">
        <div className="card-title">{filename}</div>
      </div>
    </div>
  );
}

export default ImageCard;

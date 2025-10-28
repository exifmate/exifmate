import type { ImageInfo } from '@platform/file-manager';
import { readFile } from '@tauri-apps/plugin-fs';
import { MdWarning } from 'react-icons/md';
import useSWR from 'swr';

function ImageCard({ path, filename }: ImageInfo) {
  const { data, isLoading } = useSWR(
    path,
    (p) =>
      readFile(p).then((data) => URL.createObjectURL(new Blob([data.buffer]))),
    {
      revalidateOnFocus: false,
      onError(err) {
        console.error('Failed to load thumbnail:', err);
      },
    },
  );

  return (
    <div className="card card-xs w-56 bg-neutral cursor-pointer">
      {isLoading ? (
        <div className="skeleton h-56 w-56" />
      ) : (
        <figure className="h-56 w-56 flex justify-center items-center">
          {data ? (
            <img
              src={data}
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

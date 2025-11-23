import { Image, Tooltip } from '@heroui/react';
import type { ImageInfo } from '@platform/file-manager';
import { readFile } from '@tauri-apps/plugin-fs';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import useSWR from 'swr';

function ImageCard({ path, filename }: ImageInfo) {
  const { data, isLoading, error } = useSWR(
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
    <Tooltip content={filename} placement="bottom" color="secondary" showArrow>
      <figure className="rounded-large bg-content2 flex justify-center items-center h-56 w-56">
        {error ? (
          <HiOutlineExclamationTriangle size={40} />
        ) : (
          <Image
            src={data}
            isLoading={isLoading}
            alt={`${filename} thumbnail`}
            className="h-56 object-cover"
            height={224}
            width={224}
          />
        )}
        <figcaption className="sr-only">{filename}</figcaption>
      </figure>
    </Tooltip>
  );
}

export default ImageCard;

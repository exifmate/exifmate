import { Image, Tooltip } from '@heroui/react';
import type { ImageInfo } from '@platform/file-manager';
import { readFile } from '@tauri-apps/plugin-fs';
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

  // TODO: Need to get a fallback icon again
  return (
    <Tooltip content={filename} placement="bottom" color="secondary" showArrow>
      <Image
        src={data}
        isLoading={isLoading}
        alt={`${filename} thumbnail`}
        className="h-56 object-cover"
        height={224}
        width={224}
      />
    </Tooltip>
  );
}

export default ImageCard;

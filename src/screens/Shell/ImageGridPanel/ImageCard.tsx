import { Skeleton } from '@heroui/react';
import { genThumbnail, type ImageInfo } from '@platform/file-manager';
import { revealInDirLabel } from '@platform/menus/file-menu';
import { Menu } from '@tauri-apps/api/menu';
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import useSWR from 'swr';

async function showContextMenu(path: string) {
  const contextMenu = await Menu.new({
    items: [
      {
        text: revealInDirLabel,
        async action() {
          await revealItemInDir(path);
        },
      },
    ],
  });

  contextMenu.popup();
}

function ImageCard({ path, filename }: ImageInfo) {
  const { data, isLoading, error } = useSWR(path, genThumbnail, {
    revalidateOnFocus: false,
    onError(err) {
      console.error('Failed to load thumbnail:', err);
    },
  });

  return (
    <figure
      className="flex flex-col items-center gap-1 w-56"
      onContextMenu={(e) => {
        e.preventDefault();
        showContextMenu(path).catch((err) => {
          console.error('Failed to open image card context menu:', err);
        });
      }}
    >
      <div className="flex justify-center items-center h-56 w-56 group-data-selected:scale-93 motion-safe:transition-transform">
        {error ? (
          <HiOutlineExclamationTriangle size={40} />
        ) : isLoading ? (
          <Skeleton className="h-56 w-56 rounded-field" />
        ) : (
          <img
            src={data}
            alt={`${filename} thumbnail`}
            className="h-56 object-cover rounded-field"
            height={224}
            width={224}
          />
        )}
      </div>
      <figcaption className="text-xs text-muted w-56 truncate text-center">
        {filename}
      </figcaption>
    </figure>
  );
}

export default ImageCard;

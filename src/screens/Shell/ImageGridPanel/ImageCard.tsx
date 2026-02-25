import { Skeleton, Tooltip } from '@heroui/react';
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
    <Tooltip delay={0}>
      <Tooltip.Trigger>
        <figure
          className="flex justify-center items-center h-56 w-56"
          onContextMenu={(e) => {
            e.preventDefault();
            showContextMenu(path).catch((err) => {
              console.error('Failed to open image card context menu:', err);
            });
          }}
        >
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
          <figcaption className="sr-only">{filename}</figcaption>
        </figure>
      </Tooltip.Trigger>

      <Tooltip.Content
        placement="bottom"
        showArrow
        className="bg-accent text-accent-foreground"
      >
        <Tooltip.Arrow className="[&>svg]:fill-accent" />
        {filename}
      </Tooltip.Content>
    </Tooltip>
  );
}

export default ImageCard;

import { Tooltip } from '@heroui/react';
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
    <Tooltip>
      <figure
        className="rounded-large bg-content2 flex justify-center items-center h-56 w-56"
        onContextMenu={(e) => {
          e.preventDefault();
          showContextMenu(path).catch((err) => {
            console.error('Failed to open image card context menu:', err);
          });
        }}
      >
        {error ? (
          <HiOutlineExclamationTriangle size={40} />
        ) : (
          <img
            src={data}
            // isLoading={isLoading}
            alt={`${filename} thumbnail`}
            className="h-56 object-cover"
            height={224}
            width={224}
          />
        )}
        <figcaption className="sr-only">{filename}</figcaption>
      </figure>

      <Tooltip.Content placement="bottom" showArrow>
        {filename}
      </Tooltip.Content>
    </Tooltip>
  );
}

export default ImageCard;

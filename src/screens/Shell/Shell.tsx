import { Surface } from '@heroui/react';
import useTauriListener from '@hooks/useTauriListener';
import { IMAGES_OPENED_EVENT, type ImageInfo } from '@platform/file-manager';
import FileMenu, { REVEAL_IN_DIR_EVENT } from '@platform/menus/file-menu';
import type { MenuItem } from '@tauri-apps/api/menu';
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import { useEffect, useState } from 'react';
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
} from 'react-resizable-panels';
import ImageGridPanel from './ImageGridPanel/ImageGridPanel';
import MetadataEditorPanel from './MetadataEditorPanel/MetadataEditorPanel';

function Shell() {
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: 'root-views',
    storage: localStorage,
  });

  const [selectedImages, setSelectedImages] = useState<ImageInfo[]>([]);

  useEffect(() => {
    const enableReveal = selectedImages.length === 1;

    FileMenu.get('reveal-in-dir')
      .then((item) => (item as MenuItem).setEnabled(enableReveal))
      .catch((err) => {
        console.error(
          `Failed to ${enableReveal ? 'enable' : 'disable'} reveal in dir menu item:`,
          err,
        );
      });
  }, [selectedImages.length]);

  useTauriListener(REVEAL_IN_DIR_EVENT, async () => {
    await revealItemInDir(selectedImages[0].path);
  });

  useTauriListener(IMAGES_OPENED_EVENT, () => {
    setSelectedImages([]);
  });

  return (
    <div className="flex flex-col h-screen">
      <Group
        defaultLayout={defaultLayout}
        onLayoutChanged={onLayoutChanged}
        className="p-2 gap-1"
      >
        <Panel defaultSize={65}>
          <Surface className="h-full overflow-auto rounded-3xl">
            <ImageGridPanel onImageSelection={setSelectedImages} />
          </Surface>
        </Panel>

        <Separator />

        <Panel defaultSize={35}>
          <Surface className="h-full flex flex-col rounded-3xl">
            <MetadataEditorPanel selectedImages={selectedImages} />
          </Surface>
        </Panel>
      </Group>
    </div>
  );
}

export default Shell;

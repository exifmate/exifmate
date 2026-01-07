import useTauriListener from '@hooks/useTauriListener';
import {
  REVEAL_IN_DIR_EVENT,
  setRevealInDirMenuItemEnabled,
} from '@platform/app-menu';
import type { ImageInfo } from '@platform/file-manager';
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import { useEffect, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ImageGridPanel from './ImageGridPanel/ImageGridPanel';
import MetadataEditorPanel from './MetadataEditorPanel/MetadataEditorPanel';

function Shell() {
  const [selectedImages, setSelectedImages] = useState<ImageInfo[]>([]);

  useEffect(() => {
    const enableReveal = selectedImages.length === 1;
    setRevealInDirMenuItemEnabled(enableReveal).catch((err) => {
      console.error(
        `Failed to ${enableReveal ? 'enable' : 'disable'} reveal in dir menu item:`,
        err,
      );
    });
  }, [selectedImages.length]);

  useTauriListener(REVEAL_IN_DIR_EVENT, async () => {
    await revealItemInDir(selectedImages[0].path);
  });

  return (
    <div className="flex flex-col h-screen">
      <PanelGroup direction="horizontal" className="p-2 gap-2">
        <Panel defaultSize={65} className="rounded-medium bg-default-50">
          <div className="h-full overflow-auto">
            <ImageGridPanel onImageSelection={setSelectedImages} />
          </div>
        </Panel>

        <PanelResizeHandle />

        <Panel
          defaultSize={35}
          className="rounded-medium bg-default-50 flex flex-col"
        >
          <MetadataEditorPanel selectedImages={selectedImages} />
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default Shell;

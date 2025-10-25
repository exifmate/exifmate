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
import Toolbar from './Toolbar';

function Shell() {
  const [selectedImages, setSelectedImages] = useState<ImageInfo[]>([]);

  useEffect(() => {
    if (selectedImages.length === 1) {
      setRevealInDirMenuItemEnabled(true);
    } else {
      setRevealInDirMenuItemEnabled(false);
    }
  }, [selectedImages.length]);

  useTauriListener(REVEAL_IN_DIR_EVENT, async () => {
    await revealItemInDir(selectedImages[0].path);
  });

  return (
    <div className="flex flex-col h-screen">
      <Toolbar />

      <PanelGroup direction="horizontal" className="p-2 gap-2">
        <Panel
          defaultSize={65}
          className="rounded-box bg-base-100 text-neutral-content"
        >
          <div className="h-full overflow-auto">
            <ImageGridPanel onImageSelection={setSelectedImages} />
          </div>
        </Panel>

        <PanelResizeHandle />

        <Panel
          defaultSize={35}
          className="rounded-box bg-base-100 text-neutral-content flex flex-col"
        >
          <MetadataEditorPanel selectedImages={selectedImages} />
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default Shell;

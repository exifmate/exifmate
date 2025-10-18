import type { ImageInfo } from '@app/platform/file-manager';
import { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ImageGridPanel from './ImageGridPanel/ImageGridPanel';
import MetadataEditorPanel from './MetadataEditorPanel/MetadataEditorPanel';
import Toolbar from './Toolbar';

function Shell() {
  const [selectedImages, setSelectedImages] = useState<ImageInfo[]>([]);

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

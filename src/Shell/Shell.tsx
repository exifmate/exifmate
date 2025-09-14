import type { ImageInfo } from '@app/core/file-manager';
import MetadataEditor from '@app/Editor/MetadataEditor';
import ImageGrid from '@app/ImageGrid/ImageGrid';
import { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Toolbar from './Toolbar';

function Shell() {
  const [selectedImages, setSelectedImages] = useState<ImageInfo[]>([]);

  return (
    <div className="h-screen">
      <PanelGroup direction="horizontal" className="p-2 gap-2 bg-neutral">
        <Panel
          defaultSize={65}
          className="rounded-box bg-base-100 text-neutral-content flex flex-col"
        >
          <Toolbar />

          <ImageGrid onImageSelection={setSelectedImages} />
        </Panel>

        <PanelResizeHandle />

        <Panel
          defaultSize={35}
          className="rounded-2xl bg-base-100 text-neutral-content"
        >
          <MetadataEditor selectedImages={selectedImages} />
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default Shell;

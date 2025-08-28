import { MdOutlineAddPhotoAlternate } from 'react-icons/md';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { findImages } from '../core/file-manager';
import MetadataEditor from '../Editor/MetadataEditor';
import ImageGrid from '../ImageGrid/ImageGrid';

function Toolbar() {
  return (
    <div className="bg-base-200 px-4 py-1">
      <button
        type="button"
        className="btn btn-ghost"
        // TODO: need to handle if findImages fails
        onClick={() => findImages()}
      >
        <MdOutlineAddPhotoAlternate size={26} />
        <span className="sr-only">Add Image</span>
      </button>
    </div>
  );
}

function Shell() {
  return (
    <div className="h-screen">
      <PanelGroup direction="horizontal" className="p-2 gap-2 bg-neutral">
        <Panel
          defaultSize={65}
          className="rounded-box bg-base-100 text-neutral-content flex flex-col"
        >
          <Toolbar />

          <ImageGrid />
        </Panel>

        <PanelResizeHandle />

        <Panel className="rounded-2xl bg-base-100 text-neutral-content">
          <MetadataEditor />
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default Shell;

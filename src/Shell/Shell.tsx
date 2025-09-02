import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import MetadataEditor from '../Editor/MetadataEditor';
import ImageGrid from '../ImageGrid/ImageGrid';
import Toolbar from './Toolbar';

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

        <Panel
          defaultSize={35}
          className="rounded-2xl bg-base-100 text-neutral-content"
        >
          <MetadataEditor />
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default Shell;

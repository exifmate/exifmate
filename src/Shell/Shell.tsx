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

  // return (
  //   <Stack h="100vh" gap={0}>
  //     <Flex
  //       direction="row"
  //       align="center"
  //       justify="space-between"
  //       className={titlebarStyles}
  //     >
  //       <Title order={1} size="h2">
  //         Images
  //       </Title>
  //
  //       <ActionIcon
  //         type="button"
  //         variant="filled"
  //         size="md"
  //         title="Add Images"
  //         onClick={() => findImages()}
  //       >
  //         <IconPhotoPlus />
  //       </ActionIcon>
  //     </Flex>
  //
  //     <PanelGroup direction="horizontal" className={rootStyles}>
  //       <Panel className={imageSelectionStyles} defaultSize={65}>
  //         <Box p="lg" className={imageGridPanelStyles}>
  //           <ImageGrid />
  //         </Box>
  //       </Panel>
  //
  //       <PanelResizeHandle>
  //         <Divider orientation="vertical" size="xs" h="100%" />
  //       </PanelResizeHandle>
  //
  //       <Panel className={editorPanelStyles} defaultSize={35}>
  //         <MetadataEditor />
  //       </Panel>
  //     </PanelGroup>
  //   </Stack>
  // );
}

export default Shell;

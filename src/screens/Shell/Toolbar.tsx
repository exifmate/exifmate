import { Button } from '@heroui/react';
import { findImages } from '@platform/file-manager';
import { HiPlus } from 'react-icons/hi2';

function Toolbar() {
  return (
    <div
      className="h-12 flex flex-row-reverse items-center px-4"
      data-tauri-drag-region
    >
      <Button
        title="Add Image"
        size="sm"
        variant="light"
        onPress={() => findImages()}
      >
        <HiPlus size={25} />
      </Button>
    </div>
  );
}

export default Toolbar;

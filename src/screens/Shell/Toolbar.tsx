import { findImages } from '@app/platform/file-manager';
import { MdAddPhotoAlternate } from 'react-icons/md';

function Toolbar() {
  return (
    <div
      className="bg-base-200 h-12 flex flex-row-reverse items-center px-4"
      data-tauri-drag-region
    >
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => findImages()}
      >
        <MdAddPhotoAlternate size={25} />
        <span className="sr-only">Add Image</span>
      </button>
    </div>
  );
}

export default Toolbar;

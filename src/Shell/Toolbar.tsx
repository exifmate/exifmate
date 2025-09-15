import { findImages } from '@app/platform/file-manager';
import { MdOutlineAddPhotoAlternate } from 'react-icons/md';

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

export default Toolbar;

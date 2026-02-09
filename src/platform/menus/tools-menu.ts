import { emit } from '@tauri-apps/api/event';
import { MenuItem, Submenu } from '@tauri-apps/api/menu';

export const ENTER_METADATA_EDIT_EVENT = 'editor:enter-metadata-edit';
export const FOCUS_ON_LOCATION_EVENT = 'editor:focus-on-location';

const EDIT_IMAGES_SINGULAR_LABEL = 'Edit Selected Image';
const EDIT_IMAGES_PLURAL_LABEL = 'Edit Selected Images';

const editImagesMenuItem = await MenuItem.new({
  text: EDIT_IMAGES_SINGULAR_LABEL,
  accelerator: 'CmdOrCtrl+e',
  async action() {
    await emit(ENTER_METADATA_EDIT_EVENT);
  },
});

export async function updateEditImagesLabel(isPlural: boolean) {
  await editImagesMenuItem.setText(
    isPlural ? EDIT_IMAGES_PLURAL_LABEL : EDIT_IMAGES_SINGULAR_LABEL,
  );
}

const ToolsMenu = await Submenu.new({
  text: 'Tools',
  enabled: false,
  items: [
    editImagesMenuItem,
    {
      text: 'Focus on Location',
      accelerator: 'CmdOrCtrl+l',
      async action() {
        await emit(FOCUS_ON_LOCATION_EVENT);
      },
    },
  ],
});

export default ToolsMenu;

import { emit, listen } from '@tauri-apps/api/event';
import {
  Menu,
  MenuItem,
  PredefinedMenuItem,
  Submenu,
} from '@tauri-apps/api/menu';
import { findImages } from './file-manager';

export const OPEN_SETTINGS_EVENT = 'app:open-settings';
export const SAVE_METADATA_EVENT = 'editor:save-form';
export const ENTER_METADATA_EDIT_EVENT = 'editor:enter-metadata-edit';

const SAVE_MENU_ENABLED_EVENT = 'menu:save-enabled';
const EDIT_MENU_ENABLED_EVENT = 'menu:edit-enabled';
const TOOLS_MENU_ENABLED_EVENT = 'menu:tools-enabled';
const EDIT_IMAGES_PLURALIZE_EVENT = 'menu:edit-images-pluralize';

export const setSaveMenuItemEnabled = (isEnabled: boolean) =>
  emit(SAVE_MENU_ENABLED_EVENT, { isEnabled });
export const setEditMenuEnabled = (isEnabled: boolean) =>
  emit(EDIT_MENU_ENABLED_EVENT, { isEnabled });
export const setToolsMenuEnabled = (isEnabled: boolean) =>
  emit(TOOLS_MENU_ENABLED_EVENT, { isEnabled });
export const setEditMenuImagesPluralize = (pluralize: boolean) =>
  emit(EDIT_IMAGES_PLURALIZE_EVENT, { pluralize });

export async function createAppMenu() {
  const appMenu = await Submenu.new({
    text: 'exifmate',
    items: [
      {
        text: 'Settings...',
        accelerator: 'CmdOrCtrl+,',
        async action() {
          await emit(OPEN_SETTINGS_EVENT);
        },
      },
      await PredefinedMenuItem.new({ item: 'Separator' }),
      await PredefinedMenuItem.new({ item: 'Hide' }),
      await PredefinedMenuItem.new({ item: 'HideOthers' }),
      await PredefinedMenuItem.new({ item: 'ShowAll' }),
      await PredefinedMenuItem.new({ item: 'Separator' }),
      await PredefinedMenuItem.new({ item: 'Quit' }),
    ],
  });

  const saveMenuItem = await MenuItem.new({
    text: 'Save',
    accelerator: 'CmdOrCtrl+s',
    enabled: false,
    async action() {
      await emit(SAVE_METADATA_EVENT);
    },
  });

  listen<{ isEnabled: boolean }>(
    SAVE_MENU_ENABLED_EVENT,
    ({ payload: { isEnabled } }) => {
      saveMenuItem.setEnabled(isEnabled);
    },
  );

  const fileMenu = await Submenu.new({
    text: 'File',
    items: [
      {
        text: 'Open Folder...',
        accelerator: 'CmdOrCtrl+o',
        async action() {
          await findImages();
        },
      },
      saveMenuItem,
    ],
  });

  const editMenu = await Submenu.new({
    text: 'Edit',
    enabled: false,
    items: [
      // should i have a note to users that this isn't more than undoing text?
      await PredefinedMenuItem.new({ item: 'Undo' }),
      await PredefinedMenuItem.new({ item: 'Redo' }),
      await PredefinedMenuItem.new({ item: 'Separator' }),
      await PredefinedMenuItem.new({ item: 'Cut' }),
      await PredefinedMenuItem.new({ item: 'Copy' }),
      await PredefinedMenuItem.new({ item: 'Paste' }),
      await PredefinedMenuItem.new({ item: 'SelectAll' }),
    ],
  });

  listen<{ isEnabled: boolean }>(
    EDIT_MENU_ENABLED_EVENT,
    ({ payload: { isEnabled } }) => {
      editMenu.setEnabled(isEnabled);
    },
  );

  const EDIT_IMAGES_SINGULAR_LABEL = 'Edit Selected Image';
  const EDIT_IMAGES_PLURAL_LABEL = 'Edit Selected Images';
  const editImagesMenuItem = await MenuItem.new({
    text: EDIT_IMAGES_SINGULAR_LABEL,
    accelerator: 'CmdOrCtrl+e',
    async action() {
      await emit(ENTER_METADATA_EDIT_EVENT);
    },
  });

  listen<{ pluralize: boolean }>(
    EDIT_IMAGES_PLURALIZE_EVENT,
    async ({ payload: { pluralize } }) => {
      if (pluralize) {
        await editImagesMenuItem.setText(EDIT_IMAGES_PLURAL_LABEL);
      } else {
        await editImagesMenuItem.setText(EDIT_IMAGES_SINGULAR_LABEL);
      }
    },
  );

  const toolsMenu = await Submenu.new({
    text: 'Tools',
    enabled: false,
    items: [editImagesMenuItem],
  });

  listen<{ isEnabled: boolean }>(
    TOOLS_MENU_ENABLED_EVENT,
    ({ payload: { isEnabled } }) => {
      toolsMenu.setEnabled(isEnabled);
    },
  );

  const viewMenu = await Submenu.new({
    text: 'View',
    items: [await PredefinedMenuItem.new({ item: 'Fullscreen' })],
  });

  const windowMenu = await Submenu.new({
    text: 'Window',
    items: [await PredefinedMenuItem.new({ item: 'Minimize' })],
  });

  const menu = await Menu.new({
    items: [appMenu, fileMenu, editMenu, toolsMenu, viewMenu, windowMenu],
  });

  menu.setAsAppMenu();
}

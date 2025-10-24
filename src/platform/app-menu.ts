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

async function attachEnableListener(
  eventName: string,
  menuItem: MenuItem | Submenu,
) {
  try {
    await listen<{ isEnabled: boolean }>(
      eventName,
      ({ payload: { isEnabled } }) => {
        menuItem.setEnabled(isEnabled);
      },
    );
  } catch (err) {
    console.error(`Failed to add enable listener for ${eventName}:`, err);
  }
}

async function appMenu() {
  return Submenu.new({
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
}

async function fileMenu() {
  const saveMenuItem = await MenuItem.new({
    text: 'Save',
    accelerator: 'CmdOrCtrl+s',
    enabled: false,
    async action() {
      await emit(SAVE_METADATA_EVENT);
    },
  });

  await attachEnableListener(SAVE_MENU_ENABLED_EVENT, saveMenuItem);

  return await Submenu.new({
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
}

async function editMenu() {
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

  await attachEnableListener(EDIT_MENU_ENABLED_EVENT, editMenu);

  return editMenu;
}

async function toolsMenu() {
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

  await attachEnableListener(TOOLS_MENU_ENABLED_EVENT, toolsMenu);

  return toolsMenu;
}

export async function createAppMenu() {
  const viewMenu = await Submenu.new({
    text: 'View',
    items: [await PredefinedMenuItem.new({ item: 'Fullscreen' })],
  });

  const windowMenu = await Submenu.new({
    text: 'Window',
    items: [await PredefinedMenuItem.new({ item: 'Minimize' })],
  });

  const menu = await Menu.new({
    items: [
      await appMenu(),
      await fileMenu(),
      await editMenu(),
      await toolsMenu(),
      viewMenu,
      windowMenu,
    ],
  });

  menu.setAsAppMenu();
}

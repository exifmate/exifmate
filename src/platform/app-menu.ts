import { emit, listen } from '@tauri-apps/api/event';
import {
  Menu,
  MenuItem,
  PredefinedMenuItem,
  Submenu,
} from '@tauri-apps/api/menu';
import { platform } from '@tauri-apps/plugin-os';
import { findImages } from './file-manager';

export const OPEN_SETTINGS_EVENT = 'app:open-settings';
export const SAVE_METADATA_EVENT = 'editor:save-form';
export const ENTER_METADATA_EDIT_EVENT = 'editor:enter-metadata-edit';
export const FOCUS_ON_LOCATION_EVENT = 'editor:focus-on-location';
export const REVEAL_IN_DIR_EVENT = 'app:reveal-in-dir';

const SAVE_MENU_ENABLED_EVENT = 'menu:save-enabled';
const EDIT_MENU_ENABLED_EVENT = 'menu:edit-enabled';
const TOOLS_MENU_ENABLED_EVENT = 'menu:tools-enabled';
const EDIT_IMAGES_PLURALIZE_EVENT = 'menu:edit-images-pluralize';
const REVEAL_IN_DIR_ENABLED_EVENT = 'menu:reveal-in-dir-enabled';

export const setSaveMenuItemEnabled = (isEnabled: boolean) =>
  emit(SAVE_MENU_ENABLED_EVENT, { isEnabled });
export const setEditMenuEnabled = (isEnabled: boolean) =>
  emit(EDIT_MENU_ENABLED_EVENT, { isEnabled });
export const setToolsMenuEnabled = (isEnabled: boolean) =>
  emit(TOOLS_MENU_ENABLED_EVENT, { isEnabled });
export const setEditImagesMenuItemPluralize = (pluralize: boolean) =>
  emit(EDIT_IMAGES_PLURALIZE_EVENT, { pluralize });
export const setRevealInDirMenuItemEnabled = (isEnabled: boolean) =>
  emit(REVEAL_IN_DIR_ENABLED_EVENT, { isEnabled });

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

  let fileManager: string;
  switch (platform()) {
    case 'macos':
      fileManager = 'Finder';
      break;
    case 'windows':
      fileManager = 'Explorer';
      break;
    default:
      fileManager = 'File Browser';
      break;
  }

  const revealMenuItem = await MenuItem.new({
    text: `Reveal in ${fileManager}`,
    enabled: false,
    async action() {
      await emit(REVEAL_IN_DIR_EVENT);
    },
  });

  await attachEnableListener(REVEAL_IN_DIR_ENABLED_EVENT, revealMenuItem);

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
      await PredefinedMenuItem.new({ item: 'Separator' }),
      revealMenuItem,
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

  await listen<{ pluralize: boolean }>(
    EDIT_IMAGES_PLURALIZE_EVENT,
    async ({ payload: { pluralize } }) => {
      if (pluralize) {
        await editImagesMenuItem.setText(EDIT_IMAGES_PLURAL_LABEL);
      } else {
        await editImagesMenuItem.setText(EDIT_IMAGES_SINGULAR_LABEL);
      }
    },
  );

  const focusOnLocation = await MenuItem.new({
    text: 'Focus on location',
    accelerator: 'CmdOrCtrl+l',
    async action() {
      await emit(FOCUS_ON_LOCATION_EVENT);
    },
  });

  const toolsMenu = await Submenu.new({
    text: 'Tools',
    enabled: false,
    items: [editImagesMenuItem, focusOnLocation],
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

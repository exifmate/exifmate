import { emit, listen } from '@tauri-apps/api/event';
import {
  Menu,
  MenuItem,
  PredefinedMenuItem,
  Submenu,
} from '@tauri-apps/api/menu';
import { findImages } from './file-manager';

const SAVE_ACTION = 'save-form';
const SAVE_MENU_ENABLED = 'save-enabled';
const EDIT_MENU_ENABLED = 'edit-enabled';

export const onSaveAction = (cb: () => void) => listen(SAVE_ACTION, cb);

export const setSaveMenuItemEnabled = (isEnabled: boolean) =>
  emit(SAVE_MENU_ENABLED, { isEnabled });
export const setEditMenuEnabled = (isEnabled: boolean) =>
  emit(EDIT_MENU_ENABLED, { isEnabled });

export async function createAppMenu() {
  const appMenu = await Submenu.new({
    text: 'exifmate',
    items: [
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
      await emit(SAVE_ACTION);
    },
  });

  listen<{ isEnabled: boolean }>(
    SAVE_MENU_ENABLED,
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
    EDIT_MENU_ENABLED,
    ({ payload: { isEnabled } }) => {
      editMenu.setEnabled(isEnabled);
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
    items: [appMenu, fileMenu, editMenu, viewMenu, windowMenu],
  });

  menu.setAsAppMenu();
}

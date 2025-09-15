import { Menu, PredefinedMenuItem, Submenu } from '@tauri-apps/api/menu';
import { findImages } from './file-manager';

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
    ],
    // TODO: add save options
  });

  const editMenu = await Submenu.new({
    text: 'Edit',
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

import { emit } from '@tauri-apps/api/event';
import {
  Menu,
  type MenuItemOptions,
  PredefinedMenuItem,
  Submenu,
} from '@tauri-apps/api/menu';
import { platform } from '@tauri-apps/plugin-os';
import EditMenu from './edit-menu';
import FileMenu from './file-menu';
import ToolsMenu from './tools-menu';

export const OPEN_ABOUT_EVENT = 'app:open-about';
export const OPEN_SETTINGS_EVENT = 'app:open-settings';

async function appMenu() {
  const items: (PredefinedMenuItem | MenuItemOptions)[] = [
    {
      text: 'About',
      async action() {
        await emit(OPEN_ABOUT_EVENT);
      },
    },
    await PredefinedMenuItem.new({ item: 'Separator' }),
    {
      text: 'Settings...',
      accelerator: 'CmdOrCtrl+,',
      async action() {
        await emit(OPEN_SETTINGS_EVENT);
      },
    },
  ];

  if (platform() === 'macos') {
    items.push(
      await PredefinedMenuItem.new({ item: 'Separator' }),
      await PredefinedMenuItem.new({ item: 'Hide' }),
      await PredefinedMenuItem.new({ item: 'HideOthers' }),
      await PredefinedMenuItem.new({ item: 'ShowAll' }),
      await PredefinedMenuItem.new({ item: 'Separator' }),
      await PredefinedMenuItem.new({ item: 'Quit' }),
    );
  }

  return Submenu.new({
    items,
    text: platform() === 'macos' ? 'ExifMate' : 'Help',
  });
}

export async function createAppMenu() {
  let items = [FileMenu, EditMenu, ToolsMenu];

  if (platform() === 'macos') {
    items = [
      await appMenu(),
      ...items,
      await Submenu.new({
        text: 'View',
        items: [await PredefinedMenuItem.new({ item: 'Fullscreen' })],
      }),
      await Submenu.new({
        text: 'Window',
        items: [await PredefinedMenuItem.new({ item: 'Minimize' })],
      }),
    ];
  } else {
    items.push(await appMenu());
  }

  const menu = await Menu.new({ items });

  menu.setAsAppMenu();
}

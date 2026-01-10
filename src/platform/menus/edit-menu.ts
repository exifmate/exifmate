import { PredefinedMenuItem, Submenu } from '@tauri-apps/api/menu';

const EditMenu = await Submenu.new({
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

export default EditMenu;

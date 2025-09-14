import { type } from '@tauri-apps/plugin-os';

export function isMobile() {
  return type() === 'ios';
}

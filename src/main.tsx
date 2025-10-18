import { createAppMenu } from '@app/platform/app-menu';
import Shell from '@app/screens/Shell/Shell';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import SettingsModal from './SettingsModal/SettingsModal';
import ToastRegion from './Toasts/ToastRegion';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Failed to mount react');
}

createRoot(root).render(
  <StrictMode>
    <Shell />
    <ToastRegion />
    <SettingsModal />
  </StrictMode>,
);

createAppMenu();

import { createAppMenu } from '@platform/app-menu';
import SettingsModal from '@screens/SettingsModal/SettingsModal';
import Shell from '@screens/Shell/Shell';
import ToastRegion from '@screens/Toasts/ToastRegion';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

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

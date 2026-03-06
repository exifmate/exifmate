import { ToastProvider } from '@heroui/react';
import { forwardLogging } from '@platform/logging';
import { createAppMenu } from '@platform/menus/app-menu';
import AboutModal from '@screens/AboutModal/AboutModal';
import SettingsModal from '@screens/SettingsModal/SettingsModal';
import Shell from '@screens/Shell/Shell';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

forwardLogging();
const root = document.getElementById('root');
if (!root) {
  throw new Error('Failed to mount react');
}

createRoot(root).render(
  <StrictMode>
    <ToastProvider />
    <Shell />
    <AboutModal />
    <SettingsModal />
  </StrictMode>,
);

createAppMenu().catch((err) => {
  console.error('Failed to create app menu:', err);
});

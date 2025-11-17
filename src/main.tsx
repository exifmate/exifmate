import { HeroUIProvider } from '@heroui/react';
import { createAppMenu } from '@platform/app-menu';
import { forwardLogging } from '@platform/logging';
import SettingsModal from '@screens/SettingsModal/SettingsModal';
import Shell from '@screens/Shell/Shell';
import ToastRegion from '@screens/Toasts/ToastRegion';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

forwardLogging();
const root = document.getElementById('root');
if (!root) {
  throw new Error('Failed to mount react');
}

createRoot(root).render(
  <StrictMode>
    <HeroUIProvider>
      <Shell />
      <ToastRegion />
      <SettingsModal />
    </HeroUIProvider>
  </StrictMode>,
);

createAppMenu().catch((err) => {
  console.error('Failed to create app menu:', err);
});

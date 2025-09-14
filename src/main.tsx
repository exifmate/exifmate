import { createAppMenu } from '@app/core/app-menu';
import { isMobile } from '@app/core/util';
import Notifications from '@app/Shell/Notifications';
import Shell from '@app/Shell/Shell';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Failed to mount react');
}

createRoot(root).render(
  <StrictMode>
    <Shell />
    <Notifications />
  </StrictMode>,
);

if (!isMobile()) {
  createAppMenu();
}

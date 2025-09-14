import { createAppMenu } from '@app/platform/app-menu';
import { isMobile } from '@app/platform/util';
import Shell from '@app/Shell/Shell';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ToastRegion from './Toasts/ToastRegion';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Failed to mount react');
}

createRoot(root).render(
  <StrictMode>
    <Shell />
    <ToastRegion />
  </StrictMode>,
);

if (!isMobile()) {
  createAppMenu();
}

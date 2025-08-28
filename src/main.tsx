import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createAppMenu } from './core/app-menu';
import { isMobile } from './core/util';
import { ImageProvider } from './ImageContext';
import Shell from './Shell/Shell';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Failed to mount react');
}

createRoot(root).render(
  <StrictMode>
    <ImageProvider>
      <Shell />
    </ImageProvider>
  </StrictMode>,
);

if (!isMobile()) {
  createAppMenu();
}

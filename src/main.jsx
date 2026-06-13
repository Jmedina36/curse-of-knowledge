import React from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import './index.css';
import App from './App';

// Fade images in once they finish loading (see img rules in index.css).
// Load/error don't bubble, so listen in the capture phase.
document.addEventListener('load', (e) => {
  if (e.target instanceof HTMLImageElement) e.target.classList.add('img-loaded');
}, true);
document.addEventListener('error', (e) => {
  if (e.target instanceof HTMLImageElement) e.target.classList.add('img-loaded');
}, true);

createRoot(document.getElementById('root')).render(
  <MotionConfig reducedMotion="user">
    <App />
  </MotionConfig>
);

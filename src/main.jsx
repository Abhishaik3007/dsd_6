import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './gate-glossy-overrides.css'
import './notebook-truth-table.css';
import App from './App.jsx'

// Prevent 2-finger pinch-to-zoom gestures across trackpads & touch devices
document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
document.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false });

document.addEventListener('touchmove', (e) => {
  if (e.touches && e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

document.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

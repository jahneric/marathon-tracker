import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { setSaveErrorHandler } from './store/store';
import { toast } from './ui/feedback';
import './styles/global.css';

setSaveErrorHandler(() => toast('Speichern fehlgeschlagen – Speicher voll?'));

// Browser bitten, die Daten nicht automatisch zu löschen
navigator.storage?.persist?.().catch(() => {});

// Cache der alten Version (v1, eigener Service Worker) aufräumen
if ('caches' in window) caches.delete('mt27-v1').catch(() => {});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

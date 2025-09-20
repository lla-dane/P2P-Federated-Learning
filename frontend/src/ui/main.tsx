import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { HashRouter } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext.tsx';
import { TrainingProvider } from './contexts/TrainingContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <TrainingProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </TrainingProvider>
    </SettingsProvider>
  </StrictMode>
);

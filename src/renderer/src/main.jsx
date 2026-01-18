import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner"
import App from './App';
import './index.css';
import './lib/i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './lib/i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <HashRouter>
        <App />
        <Toaster />
      </HashRouter>
    </I18nextProvider>
  </React.StrictMode>
);
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { StoreProvider } from './lib/store';
import { CloudProvider } from './lib/cloud';
import { Gate } from './pages/Login';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><StoreProvider><CloudProvider><Gate><App /></Gate></CloudProvider></StoreProvider></React.StrictMode>,
);
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

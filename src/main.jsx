import React from 'react';
import { createRoot } from 'react-dom/client';
import { WorshipProvider } from './context/WorshipContext.jsx';
import App from './App.jsx';
import './styles/app.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WorshipProvider>
      <App />
    </WorshipProvider>
  </React.StrictMode>,
);

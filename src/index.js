import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@coreui/coreui/dist/css/coreui.min.css';
import './styles/ui-theme.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

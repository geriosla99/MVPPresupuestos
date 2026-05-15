import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Estilos globales (tokens primero para que las variables CSS estén disponibles)
import './styles/tokens.css';
import './styles/layout.css';
import './styles/components.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

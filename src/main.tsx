import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/style.css';

// `main.tsx` es el punto de entrada real de React.
// Aquí conectamos React con el nodo `#root` del `index.html`.
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('No se encontró el contenedor root para montar React.');
}

// `createRoot` activa el renderizado moderno de React.
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

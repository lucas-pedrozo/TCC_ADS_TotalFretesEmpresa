import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router';
import App from './routes/App'
import './index.css'

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
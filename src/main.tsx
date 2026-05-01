import WebRoutes from './routes/Routes'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import './index.css'

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <BrowserRouter>
    <AuthProvider>
      <WebRoutes />
    </AuthProvider>
  </BrowserRouter>
);
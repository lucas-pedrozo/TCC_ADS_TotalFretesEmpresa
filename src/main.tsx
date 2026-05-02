import WebRoutes from './routes/Routes'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import './index.css'

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <BrowserRouter>
    <AuthProvider>
      <WebRoutes />
      <Toaster richColors position="top-center" />
    </AuthProvider>
  </BrowserRouter>
);
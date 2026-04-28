import WebRoutes from './routes/Routes'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from '@/context/AuthContext';
import './index.css'

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <AuthProvider>
    <WebRoutes />
  </AuthProvider>
);
import WebRoutes from './routes/Routes'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { LanguageProvider } from '@/context/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import '@/i18n';
import './index.css'

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <BrowserRouter>
    <LanguageProvider>
      <AuthProvider>
        <WebRoutes />
        <LanguageSwitcher />
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </LanguageProvider>
  </BrowserRouter>
);
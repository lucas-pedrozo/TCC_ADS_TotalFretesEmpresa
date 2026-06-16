import WebRoutes from './routes/Routes'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/context/AuthContext';
import { AuthSessionGuard } from '@/components/AuthSessionGuard';
import { Toaster } from '@/components/ui/sonner';
import { LanguageProvider } from '@/context/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import '@/i18n';
import './index.css'

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <BrowserRouter>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="app:themeMode"
      themes={["light", "dark"]}
    >
      <LanguageProvider>
        <AuthProvider>
          <AuthSessionGuard />
          <WebRoutes />
          <LanguageSwitcher />
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </BrowserRouter>
);
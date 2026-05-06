export const SUPPORTED_LANGUAGES = ["pt-BR", "en"] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = "pt-BR";

export const resources = {
  "pt-BR": {
    translation: {
      common: {
        login: "Entrar",
        signup: "Cadastre-se",
        language: "Idioma",
      },
      pages: {
        start: {
          welcome: "Seja bem-vindo",
        },
        login: {
          title: "Faça login",
          forgotPassword: "Esqueci minha senha",
          emailLabel: "Email",
          emailPlaceholder: "seu@email.com",
          passwordLabel: "Senha",
          passwordPlaceholder: "Digite sua senha",
          loading: "Entrando...",
          success: "Login realizado com sucesso!",
        },
      },
      sidebar: {
        home: "Home",
        profile: "Perfil",
        logout: "Sair",
      },
      register: {
        loading: "Criando conta...",
        success: "Conta criada com sucesso! Faça login para continuar.",
      },
      errors: {
        request: "Erro na requisição",
        unknown: "Erro desconhecido",
      },
      switcher: {
        "pt-BR": "Português (Brasil)",
        en: "Inglês",
      },
    },
  },
  en: {
    translation: {
      common: {
        login: "Sign in",
        signup: "Sign up",
        language: "Language",
      },
      pages: {
        start: {
          welcome: "Welcome",
        },
        login: {
          title: "Sign in",
          forgotPassword: "Forgot my password",
          emailLabel: "Email",
          emailPlaceholder: "your@email.com",
          passwordLabel: "Password",
          passwordPlaceholder: "Enter your password",
          loading: "Signing in...",
          success: "Signed in successfully!",
        },
      },
      sidebar: {
        home: "Home",
        profile: "Profile",
        logout: "Sign out",
      },
      register: {
        loading: "Creating account...",
        success: "Account created successfully! Sign in to continue.",
      },
      errors: {
        request: "Request error",
        unknown: "Unknown error",
      },
      switcher: {
        "pt-BR": "Portuguese (Brazil)",
        en: "English",
      },
    },
  },
} as const;

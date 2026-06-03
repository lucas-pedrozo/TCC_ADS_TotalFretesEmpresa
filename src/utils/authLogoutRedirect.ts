import { AUTH_REDIRECT_DELAY_MS, FADE_DURATION_MS } from "@/utils/ui";

type LogoutRedirectOptions = {
  showNotice: () => void;
  navigateAway: () => void;
  completeLogout: () => Promise<void>;
  delayMs?: number;
  fadeMs?: number;
};

/**
 * Toast + espera + navegação (com fade no layout) + só então limpa a sessão.
 * Evita que PrivateRoute redirecione antes da animação terminar.
 */
export async function runDelayedLogoutRedirect({
  showNotice,
  navigateAway,
  completeLogout,
  delayMs = AUTH_REDIRECT_DELAY_MS,
  fadeMs = FADE_DURATION_MS,
}: LogoutRedirectOptions) {
  showNotice();
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  navigateAway();
  await new Promise((resolve) => setTimeout(resolve, fadeMs));
  await completeLogout();
}

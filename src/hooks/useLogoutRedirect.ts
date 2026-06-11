import { useCallback } from "react";
import type { NavigateOptions } from "react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { runDelayedLogoutRedirect } from "@/utils/authLogoutRedirect";
import { AUTH_REDIRECT_DELAY_MS } from "@/utils/ui";

type NavigateWithFade = (to: string, options?: NavigateOptions) => void;

/**
 * Encerra a sessão, toast, espera {@link AUTH_REDIRECT_DELAY_MS}, depois fade + navegação.
 * Passe o `navigateWithFade` do mesmo layout que aplica `fadeExitClassName(isExiting)`.
 */
export function useLogoutRedirect(navigateWithFade: NavigateWithFade) {
  const { logout } = useAuth();
  const { t } = useTranslation();

  return useCallback(async () => {
    await runDelayedLogoutRedirect({
      showNotice: () => {
        toast.info(t("common.logoutRedirectNotice"), {
          duration: AUTH_REDIRECT_DELAY_MS,
        });
      },
      navigateAway: () => navigateWithFade("/Start", { replace: true }),
      completeLogout: logout,
    });
  }, [logout, navigateWithFade, t]);
}

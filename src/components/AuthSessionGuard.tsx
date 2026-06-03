import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { registerSessionExpiredHandler } from "@/service/authService";
import { runDelayedLogoutRedirect } from "@/utils/authLogoutRedirect";
import { AUTH_REDIRECT_DELAY_MS } from "@/utils/ui";

/** Registra logout automático quando a sessão expira ou a conta deixa de existir. */
export function AuthSessionGuard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    registerSessionExpiredHandler(async () => {
      await runDelayedLogoutRedirect({
        showNotice: () => {
          toast.info(t("common.sessionExpiredNotice"), {
            duration: AUTH_REDIRECT_DELAY_MS,
          });
        },
        navigateAway: () => navigate("/Start", { replace: true }),
        completeLogout: logout,
      });
    });

    return () => {
      registerSessionExpiredHandler(null);
    };
  }, [logout, navigate, t]);

  return null;
}

import { Navigate, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/context/AuthContext";

/** Rota-layout: use como `element={<PrivateRoute />}>` e aninhe as rotas protegidas como filhas. */
const PrivateRoute = () => {
  const { isAuthenticated, accessLevel } = useAuth();
  const { t } = useTranslation();

  if (isAuthenticated === null) {
    return (
      <div
        className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        {t("common.authSessionLoading")}
      </div>
    );
  }

  const level = accessLevel?.toUpperCase() ?? "";
  const hasAccess =
    isAuthenticated === true && (level === "COMPANY" || level === "ADMIN");

  if (!hasAccess) {
    return <Navigate to="/Login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;

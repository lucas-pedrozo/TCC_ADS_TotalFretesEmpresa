import { Navigate, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getStoredAuthSession, useAuth } from "@/context/AuthContext";

/** Rota-layout exclusiva para contas COMPANY. */
const CompanyPrivateRoute = () => {
  const { isAuthenticated, accessLevel } = useAuth();
  const { t } = useTranslation();
  const storedSession = getStoredAuthSession();

  if (isAuthenticated === null && !storedSession) {
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

  const level = (storedSession?.accessLevel ?? accessLevel)?.toUpperCase() ?? "";
  const authenticated = isAuthenticated === true || storedSession != null;

  if (!authenticated) {
    return <Navigate to="/Login" replace />;
  }

  if (level === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  if (level !== "COMPANY") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default CompanyPrivateRoute;

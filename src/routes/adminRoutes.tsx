import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";

const AdminDashboardPage = lazy(() => import("@/pages/admin/Dashboard"));
const AdminUsersPage = lazy(() => import("@/pages/admin/Users"));
const AdminUserDetailPage = lazy(() => import("@/pages/admin/Users/UserDetail"));
const AdminCompaniesPage = lazy(() => import("@/pages/admin/Companies"));
const AdminCompanyDetailPage = lazy(() => import("@/pages/admin/Companies/CompanyDetail"));
const AdminAccountsPage = lazy(() => import("@/pages/admin/Accounts"));
const AdminFreightsPage = lazy(() => import("@/pages/admin/Freights"));
const AdminFreightDetailPage = lazy(() => import("@/pages/admin/Freights/FreightDetail"));
const AdminFreightNewPage = lazy(() => import("@/pages/admin/Freights/FreightNew"));
const AdminProposalsPage = lazy(() => import("@/pages/admin/Proposals"));
const AdminProposalDetailPage = lazy(() => import("@/pages/admin/Proposals/ProposalDetail"));
const AdminCargoTypesPage = lazy(() => import("@/pages/admin/CargoTypes"));
const AdminFreightStatusTypesPage = lazy(() => import("@/pages/admin/FreightStatusTypes"));
const AdminProposalStatusTypesPage = lazy(() => import("@/pages/admin/ProposalStatusTypes"));
const AdminVehiclesPage = lazy(() => import("@/pages/admin/Vehicles"));
const AdminVehicleDetailPage = lazy(() => import("@/pages/admin/Vehicles/VehicleDetail"));
const AdminVehicleTypesPage = lazy(() => import("@/pages/admin/VehicleTypes"));
const AdminGroupVehicleTypesPage = lazy(() => import("@/pages/admin/GroupVehicleTypes"));
const AdminCnhTypesPage = lazy(() => import("@/pages/admin/CnhTypes"));

const adminFallback = (
  <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
    Carregando…
  </div>
);

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={adminFallback}>{element}</Suspense>;
}

/** Rotas filhas montadas dentro de AdminLayout. */
export const adminRouteObjects: RouteObject[] = [
  { index: true, element: withSuspense(<AdminDashboardPage />) },
  { path: "users", element: withSuspense(<AdminUsersPage />) },
  { path: "users/:id", element: withSuspense(<AdminUserDetailPage />) },
  { path: "companies", element: withSuspense(<AdminCompaniesPage />) },
  { path: "companies/:id", element: withSuspense(<AdminCompanyDetailPage />) },
  { path: "accounts", element: withSuspense(<AdminAccountsPage />) },
  { path: "freights", element: withSuspense(<AdminFreightsPage />) },
  { path: "freights/new", element: withSuspense(<AdminFreightNewPage />) },
  { path: "freights/:id", element: withSuspense(<AdminFreightDetailPage />) },
  { path: "proposals", element: withSuspense(<AdminProposalsPage />) },
  { path: "proposals/:proposalId", element: withSuspense(<AdminProposalDetailPage />) },
  { path: "cargo-types", element: withSuspense(<AdminCargoTypesPage />) },
  {
    path: "freight-status-types",
    element: withSuspense(<AdminFreightStatusTypesPage />),
  },
  {
    path: "proposal-status-types",
    element: withSuspense(<AdminProposalStatusTypesPage />),
  },
  { path: "vehicles", element: withSuspense(<AdminVehiclesPage />) },
  { path: "vehicles/:id", element: withSuspense(<AdminVehicleDetailPage />) },
  { path: "vehicle-types", element: withSuspense(<AdminVehicleTypesPage />) },
  {
    path: "group-vehicle-types",
    element: withSuspense(<AdminGroupVehicleTypesPage />),
  },
  { path: "cnh-types", element: withSuspense(<AdminCnhTypesPage />) },
];

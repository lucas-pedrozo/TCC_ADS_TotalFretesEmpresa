import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Settings2,
  Shield,
  Truck,
  Users,
  Car,
  Layers,
  CreditCard,
  ClipboardList,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useFadeNavigate } from "@/hooks/useFadeNavigate";
import { useLogoutRedirect } from "@/hooks/useLogoutRedirect";
import { cn } from "@/lib/utils";
import { fadeExitClassName } from "@/utils/ui";
import logoTotalFretes from "@/assets/logototalfretes.png";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import { AppSpacerFooter } from "@/components/custom/AppSpacerFooter";
import AdminHeader from "@/components/admin/AdminHeader";

const sidebarNavButtonClass =
  "min-h-11 h-auto min-w-0 touch-manipulation rounded-lg py-2.5 text-sm font-semibold shadow-none transition-all duration-200 md:min-h-10 md:py-2 " +
  "border border-brand-green-dark/30 bg-transparent text-brand-green-dark " +
  "hover:border-brand-green-dark hover:bg-brand-green-dark hover:text-white " +
  "data-active:border-brand-green-dark data-active:bg-brand-green data-active:text-white " +
  "focus-visible:ring-2 focus-visible:ring-brand-green/40 " +
  "group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:!h-8 group-data-[collapsible=icon]:!w-8 group-data-[collapsible=icon]:min-h-0! group-data-[collapsible=icon]:min-w-0! " +
  "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-2! group-data-[collapsible=icon]:py-0! " +
  "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:max-w-8";

const sidebarLogoutButtonClass =
  "min-h-11 h-auto min-w-0 touch-manipulation rounded-lg py-2.5 text-sm font-semibold shadow-none transition-all duration-200 md:min-h-10 md:py-2 " +
  "border-2 border-red-600 bg-transparent text-red-600 " +
  "hover:border-red-700 hover:bg-red-600 hover:text-white " +
  "focus-visible:ring-2 focus-visible:ring-red-500/40 " +
  "group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:!h-8 group-data-[collapsible=icon]:!w-8 group-data-[collapsible=icon]:min-h-0! group-data-[collapsible=icon]:min-w-0! " +
  "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-2! group-data-[collapsible=icon]:py-0! " +
  "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:max-w-8";

type NavItem = {
  label: string;
  icon: typeof LayoutDashboard;
  to: string;
  matchPrefix?: boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

export const AdminLayout = () => {
  const location = useLocation();
  const { navigateWithFade, isExiting } = useFadeNavigate();
  const logoutAndRedirect = useLogoutRedirect(navigateWithFade);
  const { t } = useTranslation();

  const isActive = (item: NavItem) => {
    if (item.to === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/";
    }
    if (item.matchPrefix !== false) {
      return location.pathname.startsWith(item.to);
    }
    return location.pathname === item.to;
  };

  const sections: NavSection[] = [
    {
      label: t("sidebar.admin.sections.overview"),
      items: [
        {
          label: t("sidebar.admin.dashboard"),
          icon: LayoutDashboard,
          to: "/admin",
        },
      ],
    },
    {
      label: t("sidebar.admin.sections.operations"),
      items: [
        { label: t("sidebar.admin.freights"), icon: Truck, to: "/admin/freights" },
        { label: t("sidebar.admin.proposals"), icon: FileText, to: "/admin/proposals" },
      ],
    },
    {
      label: t("sidebar.admin.sections.people"),
      items: [
        { label: t("sidebar.admin.users"), icon: Users, to: "/admin/users" },
        { label: t("sidebar.admin.companies"), icon: Building2, to: "/admin/companies" },
        { label: t("sidebar.admin.accounts"), icon: CreditCard, to: "/admin/accounts" },
      ],
    },
    {
      label: t("sidebar.admin.sections.catalogs"),
      items: [
        { label: t("sidebar.admin.cargoTypes"), icon: Package, to: "/admin/cargo-types" },
        {
          label: t("sidebar.admin.freightStatusTypes"),
          icon: ClipboardList,
          to: "/admin/freight-status-types",
        },
        {
          label: t("sidebar.admin.proposalStatusTypes"),
          icon: Settings2,
          to: "/admin/proposal-status-types",
        },
        { label: t("sidebar.admin.vehicles"), icon: Car, to: "/admin/vehicles" },
        { label: t("sidebar.admin.vehicleTypes"), icon: Layers, to: "/admin/vehicle-types" },
        {
          label: t("sidebar.admin.groupVehicleTypes"),
          icon: Shield,
          to: "/admin/group-vehicle-types",
        },
        { label: t("sidebar.admin.cnhTypes"), icon: Shield, to: "/admin/cnh-types" },
      ],
    },
  ];

  return (
    <div
      className={cn(
        "flex min-h-svh w-full flex-1",
        fadeExitClassName(isExiting)
      )}
    >
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader className="gap-0 border-b border-sidebar-border/80 p-2 md:p-3 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-2">
            <Link
              to="/admin"
              className={cn(
                "flex min-w-0 items-center gap-2 rounded-lg p-1.5 outline-none ring-sidebar-ring transition-colors",
                "hover:bg-brand-green-light/40 focus-visible:ring-2 focus-visible:ring-brand-green/35",
                "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
              )}
            >
              <img
                src={logoTotalFretes}
                alt=""
                width={40}
                height={40}
                decoding="async"
                className="size-9 shrink-0 rounded-lg object-contain group-data-[collapsible=icon]:size-8 md:size-10"
              />
              <span
                className={cn(
                  "min-w-0 flex-1 text-left text-sm font-semibold leading-snug text-brand-green-dark md:text-base",
                  "group-data-[collapsible=icon]:hidden"
                )}
              >
                {t("sidebar.admin.brandName")}
              </span>
            </Link>
          </SidebarHeader>

          <SidebarContent className="px-2 pt-2 md:px-2 md:pt-3 group-data-[collapsible=icon]:px-1">
            {sections.map((section) => (
              <SidebarGroup
                key={section.label}
                className="group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:items-center"
              >
                <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
                  {section.label}
                </SidebarGroupLabel>
                <SidebarGroupContent className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
                  <SidebarMenu className="gap-2 md:gap-1.5 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:items-center">
                    {section.items.map((item) => (
                      <SidebarMenuItem
                        key={item.to}
                        className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center"
                      >
                        <SidebarMenuButton
                          isActive={isActive(item)}
                          tooltip={item.label}
                          size="lg"
                          className={sidebarNavButtonClass}
                          render={<Link to={item.to} />}
                        >
                          <item.icon className="shrink-0" />
                          <span className="truncate group-data-[collapsible=icon]:hidden">
                            {item.label}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarSeparator className="mx-2" />

          <SidebarFooter className="p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-1">
            <SidebarMenu className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:items-center">
              <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center">
                <SidebarMenuButton
                  tooltip={t("sidebar.admin.logout")}
                  size="lg"
                  className={sidebarLogoutButtonClass}
                  onClick={() => void logoutAndRedirect()}
                >
                  <LogOut className="shrink-0" />
                  <span className="truncate group-data-[collapsible=icon]:hidden">
                    {t("sidebar.admin.logout")}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="min-w-0 flex-1">
          <AdminHeader onLogout={logoutAndRedirect} />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex min-w-0 flex-1 flex-col">
              <Outlet />
            </div>
            <AppSpacerFooter />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

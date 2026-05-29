import { useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { HomeIcon, UserIcon, LogOutIcon, TruckIcon, HistoryIcon, FileTextIcon } from "lucide-react";
import { useFadeNavigate } from "@/hooks/useFadeNavigate";
import { useLogoutRedirect } from "@/hooks/useLogoutRedirect";
import { useTranslation } from "react-i18next";
import { useGetCompany } from "@/hooks/useGetCompany";
import type { SideLayoutOutletContext } from "@/layout/sideLayoutOutletContext";
import { cn } from "@/lib/utils";
import { fadeExitClassName } from "@/utils/ui";
import logoTotalFretes from "@/assets/logototalfretes.png";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import { AppSpacerFooter } from "@/components/custom/AppSpacerFooter";
import Header from "@/components/custom/Header";

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

export const SideLayout = () => {
  const location = useLocation();
  const { navigateWithFade, isExiting } = useFadeNavigate();
  const logoutAndRedirect = useLogoutRedirect(navigateWithFade);
  const { t } = useTranslation();
  const { companyData, isLoading: isCompanyLoading, handleGetCompany } =
    useGetCompany();

  useEffect(() => {
    void handleGetCompany();
  }, [handleGetCompany]);

  const outletContext: SideLayoutOutletContext = {
    companyData,
    isCompanyLoading,
    handleGetCompany,
  };

  const navItems = [
    { label: t("sidebar.home"), icon: HomeIcon, to: "/Home" },
    { label: t("sidebar.freights"), icon: TruckIcon, to: "/Freights" },
    { label: t("sidebar.proposals"), icon: FileTextIcon, to: "/Proposals" },
    { label: t("sidebar.history"), icon: HistoryIcon, to: "/History" },
    { label: t("sidebar.profile"), icon: UserIcon, to: "/Perfil" },
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
            to="/Home"
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
              {t("sidebar.brandName")}
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-2 pt-2 md:px-2 md:pt-3 group-data-[collapsible=icon]:px-1">
          <SidebarGroup className="group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:items-center">
            <SidebarGroupContent className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
              <SidebarMenu className="gap-2 md:gap-1.5 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:items-center">
                {navItems.map((item) => (
                  <SidebarMenuItem
                    key={item.to}
                    className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center"
                  >
                    <SidebarMenuButton
                      isActive={location.pathname === item.to}
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
        </SidebarContent>

        <SidebarSeparator className="mx-2" />

        <SidebarFooter className="p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-1">
          <SidebarMenu className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:items-center">
            <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center">
              <SidebarMenuButton
                tooltip={t("sidebar.logout")}
                size="lg"
                className={sidebarLogoutButtonClass}
                onClick={() => void logoutAndRedirect()}
              >
                <LogOutIcon className="shrink-0" />
                <span className="truncate group-data-[collapsible=icon]:hidden">
                  {t("sidebar.logout")}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 flex-1">
        <Header
          companyData={companyData}
          isCompanyLoading={isCompanyLoading}
          onLogout={logoutAndRedirect}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 flex-1 flex-col">
            <Outlet context={outletContext} />
          </div>
          <AppSpacerFooter />
        </div>
      </SidebarInset>
    </SidebarProvider>
    </div>
  );
};

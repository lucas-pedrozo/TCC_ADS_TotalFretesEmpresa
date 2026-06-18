import { LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ThemeModeToggle } from "@/components/ThemeModeToggle";

type AdminHeaderProps = {
  onLogout: () => void | Promise<void>;
};

function adminHeaderTitle(pathname: string, t: (key: string) => string): string {
  if (pathname === "/admin" || pathname === "/admin/") {
    return t("pages.admin.dashboard.title");
  }
  if (pathname.startsWith("/admin/users")) {
    return t("pages.admin.users.title");
  }
  if (pathname.startsWith("/admin/companies")) {
    return t("pages.admin.companies.title");
  }
  if (pathname.startsWith("/admin/accounts")) {
    return t("pages.admin.accounts.title");
  }
  if (pathname.startsWith("/admin/freights")) {
    return t("pages.admin.freights.title");
  }
  if (pathname.startsWith("/admin/proposals")) {
    return t("pages.admin.proposals.title");
  }
  if (pathname.startsWith("/admin/cargo-types")) {
    return t("pages.admin.cargoTypes.title");
  }
  if (pathname.startsWith("/admin/freight-status-types")) {
    return t("pages.admin.freightStatusTypes.title");
  }
  if (pathname.startsWith("/admin/proposal-status-types")) {
    return t("pages.admin.proposalStatusTypes.title");
  }
  if (pathname.startsWith("/admin/vehicles")) {
    return t("pages.admin.vehicles.title");
  }
  if (pathname.startsWith("/admin/vehicle-types")) {
    return t("pages.admin.vehicleTypes.title");
  }
  if (pathname.startsWith("/admin/group-vehicle-types")) {
    return t("pages.admin.groupVehicleTypes.title");
  }
  if (pathname.startsWith("/admin/cnh-types")) {
    return t("pages.admin.cnhTypes.title");
  }
  return t("sidebar.admin.brandName");
}

const AdminHeader = ({ onLogout }: AdminHeaderProps) => {
  const location = useLocation();
  const { t } = useTranslation();
  const title = adminHeaderTitle(location.pathname, t);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:h-16 md:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-6" />
      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="truncate text-base font-semibold text-foreground md:text-lg">
          {title}
        </h1>
      </div>
      <ThemeModeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "hidden gap-2 sm:inline-flex"
          )}
        >
          {t("sidebar.admin.brandName")}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => void onLogout()}
          >
            <LogOut className="mr-2 size-4" />
            {t("sidebar.admin.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="sm:hidden"
        aria-label={t("sidebar.admin.logout")}
        onClick={() => void onLogout()}
      >
        <LogOut className="size-4" />
      </Button>
    </header>
  );
};

export default AdminHeader;

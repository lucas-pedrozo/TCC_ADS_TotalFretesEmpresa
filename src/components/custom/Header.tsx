import { Bell, LogOut, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { AppLanguage } from "@/i18n/resources";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import type { CompanyData } from "@/hooks/useGetCompany";
import { cn } from "@/lib/utils";

function companyInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const words = trimmed.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 1) {
    const w = words[0];
    return w.slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function headerTitle(pathname: string, t: (key: string) => string) {
  if (pathname.startsWith("/Perfil")) {
    return t("header.profileTitle");
  }
  if (pathname.startsWith("/Freights")) {
    return t("header.freightsTitle");
  }
  if (/^\/Proposals\/[^/]+/.test(pathname)) {
    return t("header.proposalDetailTitle");
  }
  if (pathname.startsWith("/Proposals")) {
    return t("header.proposalsTitle");
  }
  return t("header.homeTitle");
}

function headerSubtitle(pathname: string, t: (key: string) => string): string | null {
  if (/^\/Proposals\/[^/]+/.test(pathname)) {
    return t("header.proposalDetailSubtitle");
  }
  if (pathname.startsWith("/Proposals")) {
    return t("header.proposalsSubtitle");
  }
  return null;
}

function freightsHeaderDate(locale: string): string {
  const tag = locale === "en" ? "en-US" : "pt-BR";
  return new Intl.DateTimeFormat(tag, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

type HeaderProps = {
  companyData: CompanyData | null;
  isCompanyLoading: boolean;
  onLogout: () => void | Promise<void>;
};

const Header = ({ companyData, isCompanyLoading, onLogout }: HeaderProps) => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = headerTitle(pathname, t);
  const isFreights = pathname.startsWith("/Freights");
  const freightsDateLine = isFreights
    ? freightsHeaderDate(i18n.language as AppLanguage)
    : null;
  const subtitleLine = freightsDateLine ?? headerSubtitle(pathname, t);

  const displayName = companyData?.name?.trim() ?? "";
  const email = companyData?.email?.trim() ?? "";

  return (
    <header className="sticky top-0 z-30 flex min-w-0 max-w-full shrink-0 items-center justify-between gap-2 border-b bg-background px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 md:gap-4 md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <SidebarTrigger className="-ml-0.5 size-9 shrink-0 touch-manipulation sm:-ml-1" />
        <Separator
          orientation="vertical"
          className="hidden h-6 sm:block"
          aria-hidden
        />
        <div className="min-w-0 pr-1">
          <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
            {title}
          </h1>
          {subtitleLine ? (
            <p
              className={cn(
                "mt-0.5 truncate text-xs text-muted-foreground sm:text-sm",
                isFreights && "capitalize"
              )}
            >
              {subtitleLine}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <TooltipProvider delay={200}>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative size-9 shrink-0 touch-manipulation"
                  aria-label={t("header.notifications")}
                >
                  <Bell className="size-[1.15rem] sm:size-5" />
                  <span
                    className="absolute top-1.5 right-1.5 size-2 rounded-full border-2 border-background bg-brand-green-light"
                    aria-hidden
                  />
                </Button>
              }
            />
            <TooltipContent>{t("header.notifications")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "h-auto max-w-fit shrink-0 gap-2 rounded-full px-2 py-1.5 shadow-xs sm:max-w-[min(220px,calc(100vw-11rem))] sm:px-3",
              "touch-manipulation"
            )}
            aria-label={
              displayName ||
              t("header.companyNameFallback")
            }
          >
            <Avatar className="size-8">
              <AvatarFallback
                className={cn(
                  "bg-brand-green-dark text-xs font-semibold text-white"
                )}
              >
                {companyInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden min-w-0 max-w-[min(200px,40vw)] truncate text-left text-sm font-semibold sm:inline">
              {isCompanyLoading ? (
                <Skeleton className="inline-block h-4 w-20 align-middle sm:w-24" />
              ) : displayName ? (
                displayName
              ) : (
                <span className="font-normal text-muted-foreground">
                  {t("header.companyNameFallback")}
                </span>
              )}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className={cn(
              "max-w-[calc(100vw-1.5rem)] rounded-xl p-0 shadow-md",
              "min-w-[min(20rem,calc(100vw-1.5rem))]"
            )}
          >
            <div className="flex gap-3 p-3">
              <Avatar className="size-12 shrink-0 rounded-full">
                <AvatarFallback
                  className={cn(
                    "rounded-full bg-brand-green-dark text-sm font-semibold text-white"
                  )}
                >
                  {companyInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="pt-1 truncate text-sm font-semibold leading-snug text-foreground">
                  {isCompanyLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : displayName ? (
                    displayName
                  ) : (
                    t("header.companyNameFallback")
                  )}
                </p>
                <p className="truncate text-xs leading-snug text-muted-foreground">
                  {isCompanyLoading ? (
                    <Skeleton className="h-3 w-40" />
                  ) : email ? (
                    email
                  ) : (
                    "—"
                  )}
                </p>
                {/* <p className="truncate text-xs leading-snug text-muted-foreground">
                  {roleLine}
                </p> */}
              </div>
            </div>

            <DropdownMenuSeparator className="my-0" />

            <div className="p-1">
              <DropdownMenuItem
                className="cursor-pointer gap-2 rounded-md py-2"
                onClick={() => navigate("/Perfil")}
              >
                <User className="size-4 shrink-0 text-muted-foreground" />
                {t("header.editProfile")}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer gap-2 rounded-md py-2"
                onClick={() => void onLogout()}
              >
                <LogOut className="size-4 shrink-0" />
                {t("sidebar.logout")}
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;

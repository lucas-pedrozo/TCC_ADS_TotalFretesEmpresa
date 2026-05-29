import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import logoTotalFretes from "@/assets/logototalfretes.png";

import packageJson from "../../../package.json";

const appVersion = packageJson.version;

export function AppSpacerFooter({ className }: { className?: string }) {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "mt-auto shrink-0 border-t border-border/80 bg-muted/30 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className
      )}
    >
      <div className="flex w-full flex-row items-center justify-between gap-4 px-4 py-6 md:gap-6 md:px-8">
        <Link
          to="/Home"
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg outline-none transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand-green/40 sm:flex-initial"
        >
          <img
            src={logoTotalFretes}
            alt=""
            width={36}
            height={36}
            decoding="async"
            className="size-9 shrink-0 rounded-lg object-contain"
          />
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold text-brand-green-dark">
              {t("sidebar.brandName")}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>
        </Link>

        <div className="flex shrink-0 flex-col justify-center gap-1 text-right">
          <p className="text-xs text-muted-foreground">
            {t("footer.copyright", { year })}
          </p>
          <p className="text-[0.6875rem] text-muted-foreground/80">
            {t("footer.version", { version: appVersion })}
          </p>
        </div>
      </div>
    </footer>
  );
}

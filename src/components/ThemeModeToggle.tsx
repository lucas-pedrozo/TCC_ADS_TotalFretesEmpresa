import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeModeToggleProps = {
  className?: string;
  size?: "sm" | "default";
  showLabel?: boolean;
};

export function ThemeModeToggle({
  className,
  size = "sm",
  showLabel = false,
}: ThemeModeToggleProps) {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const handleToggle = () => setTheme(isDark ? "light" : "dark");
  const icon = isDark ? <Sun className="size-4" /> : <Moon className="size-4" />;
  const label = isDark ? t("common.lightMode") : t("common.darkMode");

  return (
    <Button
      type="button"
      variant="outline"
      size={size === "default" ? "default" : "icon-sm"}
      className={cn(showLabel && "px-3", className)}
      onClick={handleToggle}
      aria-label={label}
      title={label}
    >
      {icon}
      {showLabel ? <span>{label}</span> : null}
    </Button>
  );
}

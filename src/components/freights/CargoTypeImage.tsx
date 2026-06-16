import { useState } from "react";
import { useTranslation } from "react-i18next";

import { CARGO_IMAGE_FALLBACK_URL } from "@/constants/cargoImage";
import { cn } from "@/lib/utils";

export const CARGO_IMAGE_WIDTH = 200;
export const CARGO_IMAGE_HEIGHT = 83;

export type CargoTypeImageSize = "preview" | "list" | "trigger";

const sizeStyles: Record<CargoTypeImageSize, { container: string; allowShrink?: boolean }> = {
  preview: {
    container: "aspect-[200/83] w-full max-w-[200px] min-w-0",
    allowShrink: true,
  },
  list: {
    container: "h-[50px] w-[120px] max-w-full",
  },
  trigger: {
    container: "h-5 w-12",
  },
};

type CargoTypeImageProps = {
  imageUrl?: string | null;
  name?: string | null;
  size?: CargoTypeImageSize;
  className?: string;
};

export function CargoTypeImage({
  imageUrl,
  name,
  size = "preview",
  className,
}: CargoTypeImageProps) {
  const { t } = useTranslation();
  const styles = sizeStyles[size];
  const [useFallback, setUseFallback] = useState(false);

  const resolvedSrc =
    useFallback || !imageUrl?.trim() ? CARGO_IMAGE_FALLBACK_URL : imageUrl.trim();

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/50",
        styles.allowShrink ? "min-w-0" : "shrink-0",
        styles.container,
        className
      )}
    >
      <img
        src={resolvedSrc}
        alt={name ?? t("pages.freightForm.cargoType")}
        className="size-full max-w-full object-contain"
        loading="lazy"
        onError={() => setUseFallback(true)}
      />
    </div>
  );
}

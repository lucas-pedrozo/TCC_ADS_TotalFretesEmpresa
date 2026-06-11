import { useState } from "react";
import { useTranslation } from "react-i18next";

import { CARGO_IMAGE_FALLBACK_URL } from "@/constants/cargoImage";
import { cn } from "@/lib/utils";

export const CARGO_IMAGE_WIDTH = 200;
export const CARGO_IMAGE_HEIGHT = 83;

export type CargoTypeImageSize = "preview" | "list" | "trigger";

const sizeStyles: Record<CargoTypeImageSize, { container: string }> = {
  preview: {
    container: "h-[83px] w-[200px]",
  },
  list: {
    container: "h-[50px] w-[120px]",
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
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/50",
        styles.container,
        className
      )}
    >
      <img
        src={resolvedSrc}
        alt={name ?? t("pages.freightForm.cargoType")}
        width={CARGO_IMAGE_WIDTH}
        height={CARGO_IMAGE_HEIGHT}
        className="size-full object-contain"
        onError={() => setUseFallback(true)}
      />
    </div>
  );
}

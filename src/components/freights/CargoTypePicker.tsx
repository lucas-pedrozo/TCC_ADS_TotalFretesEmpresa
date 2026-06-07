import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, Package } from "lucide-react";
import { useTranslation } from "react-i18next";

import { fetchStoredImageById } from "@/components/admin/AdminImageField";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { CargoTypeDto } from "@/types/freight";
import { cn } from "@/lib/utils";

type CargoTypePickerProps = {
  cargoTypes: CargoTypeDto[];
  value: string;
  onChange: (id: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  selectClassName?: string;
};

const defaultSelectClass =
  "flex w-full min-w-0 min-h-11 touch-manipulation rounded-md border border-input bg-transparent px-2.5 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:min-h-9 md:py-1 md:text-sm";

function useCargoTypeImages(cargoTypes: CargoTypeDto[]) {
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const imageIds = useMemo(
    () =>
      cargoTypes
        .map((type) => type.imageCargo_id)
        .filter((id): id is number => id != null && id > 0),
    [cargoTypes]
  );

  const imageIdsKey = imageIds.join(",");

  useEffect(() => {
    if (imageIds.length === 0) {
      setImageUrls({});
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void Promise.all(
      imageIds.map(async (id) => {
        const stored = await fetchStoredImageById("cargo-images", id);
        return [id, stored?.url ?? ""] as const;
      })
    ).then((entries) => {
      if (cancelled) return;
      const next: Record<number, string> = {};
      for (const [id, url] of entries) {
        if (url) next[id] = url;
      }
      setImageUrls(next);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [imageIdsKey, imageIds]);

  return { imageUrls, isLoading };
}

function CargoTypeThumb({
  imageUrl,
  name,
  size = "sm",
  className,
}: {
  imageUrl?: string;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { t } = useTranslation();
  const sizeClass =
    size === "lg" ? "size-24" : size === "md" ? "size-12" : "size-8";

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted/50",
        sizeClass,
        className
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name ?? t("pages.freightForm.cargoType")}
          className="size-full object-cover"
        />
      ) : (
        <Package
          className={cn(
            "text-muted-foreground opacity-60",
            size === "lg" ? "size-10" : size === "md" ? "size-5" : "size-4"
          )}
          aria-hidden
        />
      )}
    </div>
  );
}

export function CargoTypePicker({
  cargoTypes,
  value,
  onChange,
  required = false,
  disabled = false,
  className,
  selectClassName = defaultSelectClass,
}: CargoTypePickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { imageUrls, isLoading } = useCargoTypeImages(cargoTypes);

  const selectedType = useMemo(
    () => cargoTypes.find((type) => String(type.id) === value),
    [cargoTypes, value]
  );

  const selectedImageUrl =
    selectedType?.imageCargo_id != null ? imageUrls[selectedType.imageCargo_id] : undefined;

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div>
        <Label id="freight-cargo-type-label">{t("pages.freightForm.cargoType")}</Label>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("pages.freightForm.cargoTypeSelectHint")}
        </p>
      </div>

      <input
        type="hidden"
        name="cargoType_id"
        value={value}
        required={required}
        tabIndex={-1}
        aria-hidden
        readOnly
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          id="freight-cargo-type"
          disabled={disabled || cargoTypes.length === 0}
          aria-labelledby="freight-cargo-type-label"
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(selectClassName, "items-center justify-between gap-2 text-left")}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            {selectedType ? (
              <>
                <CargoTypeThumb
                  imageUrl={selectedImageUrl}
                  name={selectedType.name}
                  size="sm"
                />
                <span className="truncate">{selectedType.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">
                {t("pages.freightForm.selectCargoType")}
              </span>
            )}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
            aria-hidden
          />
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={4}
          className="max-h-64 w-(--anchor-width) min-w-(--anchor-width) gap-0 overflow-y-auto p-1"
        >
          <ul role="listbox" aria-label={t("pages.freightForm.cargoType")} className="space-y-0.5">
            {cargoTypes.map((type) => {
              const isSelected = value === String(type.id);
              const imageUrl =
                type.imageCargo_id != null ? imageUrls[type.imageCargo_id] : undefined;

              return (
                <li key={type.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(String(type.id))}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-1",
                      isSelected && "bg-brand-green/10 text-foreground"
                    )}
                  >
                    <CargoTypeThumb imageUrl={imageUrl} name={type.name} size="sm" />
                    <span className="min-w-0 flex-1 truncate font-medium">{type.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>

      {isLoading && cargoTypes.some((type) => type.imageCargo_id) && !selectedType ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          <span>{t("pages.freightDetail.loading")}</span>
        </div>
      ) : null}

      {selectedType ? (
        <div className="relative mt-1 rounded-xl border border-brand-green/25 bg-brand-green/5 p-4 shadow-xs">
          <div
            className="absolute -top-1.5 left-8 size-3 rotate-45 border-l border-t border-brand-green/25 bg-brand-green/5"
            aria-hidden
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <CargoTypeThumb
              imageUrl={selectedImageUrl}
              name={selectedType.name}
              size="lg"
              className="rounded-lg sm:size-28"
            />

            <div className="min-w-0 flex-1 space-y-1 pt-0.5">
              <p className="text-base font-semibold leading-snug text-foreground">
                {selectedType.name}
              </p>
              {!selectedImageUrl && !isLoading ? (
                <p className="text-xs text-muted-foreground">
                  {t("pages.freightForm.cargoTypeNoImage")}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

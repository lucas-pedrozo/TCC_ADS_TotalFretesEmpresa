import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  COMPANY_LOGO_ACCEPTED_SOURCE_TYPES,
  COMPANY_LOGO_MAX_BYTES,
} from "@/constants/companyLogo";
import http from "@/service/http";
import { trataErroAxios } from "@/utils/trataErroAxios";

export type StoredImageDto = {
  id: number;
  url?: string | null;
  originalName?: string | null;
};

type UploadResponse = {
  message?: string;
} & Record<string, StoredImageDto | string | undefined>;

function readUploadedImage(
  data: UploadResponse,
  responseKey: string
): StoredImageDto | null {
  const value = data[responseKey];
  return value && typeof value === "object" ? value : null;
}

type AdminImageFieldProps = {
  label: string;
  imageId: number | null | undefined;
  onImageIdChange: (id: number | null) => void;
  disabled?: boolean;
  imageBasePath?: string;
  imageResponseKey?: string;
  ownerType?: "USER";
  ownerId?: number | null;
};

export async function fetchStoredImageById(
  basePath: string,
  id: number
): Promise<StoredImageDto | null> {
  try {
    const { data } = await http.get<StoredImageDto>(`/${basePath}/${id}`);
    return data;
  } catch {
    return null;
  }
}

export function AdminImageField({
  label,
  imageId,
  onImageIdChange,
  disabled,
  imageBasePath = "user-images",
  imageResponseKey = "userImage",
  ownerType,
  ownerId,
}: AdminImageFieldProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!imageId) {
        setPreviewUrl(null);
        return;
      }

      const image = await fetchStoredImageById(imageBasePath, imageId);
      if (!cancelled) {
        setPreviewUrl(image?.url ?? null);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [imageBasePath, imageId]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (
        !COMPANY_LOGO_ACCEPTED_SOURCE_TYPES.includes(
          file.type as (typeof COMPANY_LOGO_ACCEPTED_SOURCE_TYPES)[number]
        )
      ) {
        toast.error(t("pages.admin.common.invalidImage"));
        return;
      }

      if (file.size > COMPANY_LOGO_MAX_BYTES) {
        toast.error(t("pages.admin.common.imageTooLarge"));
        return;
      }

      setIsUploading(true);
      const toastId = toast.loading(t("pages.admin.common.uploadingImage"));

      try {
        const formData = new FormData();
        formData.append("image", file);

        if (imageId) {
          const { data } = await http.put<UploadResponse>(
            `/${imageBasePath}/${imageId}`,
            formData
          );
          const next = readUploadedImage(data, imageResponseKey);
          if (next?.id) {
            onImageIdChange(next.id);
            setPreviewUrl(next.url ?? null);
          }
        } else {
          if (imageBasePath === "user-images") {
            if (ownerType !== "USER" || !ownerId) {
              toast.error(t("USER_IMAGE.INVALID_OWNER"), { id: toastId });
              return;
            }
            formData.append("ownerType", ownerType);
            formData.append("ownerId", String(ownerId));
          }

          const { data } = await http.post<UploadResponse>(
            `/${imageBasePath}/upload`,
            formData
          );
          const next = readUploadedImage(data, imageResponseKey);
          if (next?.id) {
            onImageIdChange(next.id);
            setPreviewUrl(next.url ?? null);
          }
        }

        toast.success(t("pages.admin.common.imageUploaded"), { id: toastId });
      } catch (error) {
        toast.error(trataErroAxios(error), { id: toastId });
      } finally {
        setIsUploading(false);
      }
    },
    [imageBasePath, imageId, imageResponseKey, onImageIdChange, ownerId, ownerType, t]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) void uploadFile(file);
      event.target.value = "";
    },
    [uploadFile]
  );

  const handleRemove = useCallback(async () => {
    if (!imageId) {
      onImageIdChange(null);
      setPreviewUrl(null);
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(t("pages.admin.common.removingImage"));

    try {
      await http.delete(`/${imageBasePath}/${imageId}`);
      onImageIdChange(null);
      setPreviewUrl(null);
      toast.success(t("pages.admin.common.imageRemoved"), { id: toastId });
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsUploading(false);
    }
  }, [imageBasePath, imageId, onImageIdChange, t]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex size-20 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            {t("pages.admin.common.selectImage")}
          </Button>
          {(previewUrl || imageId) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => void handleRemove()}
            >
              <X className="mr-1 size-4" />
              {t("pages.admin.common.removeImage")}
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={COMPANY_LOGO_ACCEPTED_SOURCE_TYPES.join(",")}
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import type { Area, Point } from "react-easy-crop";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import {
  COMPANY_LOGO_ACCEPTED_SOURCE_TYPES,
  COMPANY_LOGO_MAX_BYTES,
  COMPANY_LOGO_MIME,
} from "@/constants/companyLogo";
import http from "@/service/http";
import { getCroppedImageBlob } from "@/utils/cropImage";
import { trataErroAxios, traduzMensagemApi } from "@/utils/trataErroAxios";

const ACCEPTED_IMAGE_TYPES: string[] = [...COMPANY_LOGO_ACCEPTED_SOURCE_TYPES];

type UpdateResponse = {
  message?: string;
};

type UseAdminCompanyImageParams = {
  companyId: string | undefined;
  imageUrl: string | null;
  imageOriginalName: string | null;
  onReload: () => Promise<void>;
};

function safeRevokeObjectUrl(url: string | null) {
  if (!url) return;
  URL.revokeObjectURL(url);
}

export function useAdminCompanyImage({
  companyId,
  imageUrl,
  imageOriginalName,
  onReload,
}: UseAdminCompanyImageParams) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sourceObjectUrlRef = useRef<string | null>(null);
  const previewObjectUrlRef = useRef<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [hasLocalSelection, setHasLocalSelection] = useState(false);

  const hasPersistedImage = Boolean(imageUrl);

  const resetEditorState = useCallback(() => {
    safeRevokeObjectUrl(sourceObjectUrlRef.current);
    sourceObjectUrlRef.current = null;
    safeRevokeObjectUrl(previewObjectUrlRef.current);
    previewObjectUrlRef.current = null;

    setImageSource(imageUrl);
    setPreviewImageSrc(imageUrl);
    setSelectedFileName(imageOriginalName);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);
    setHasLocalSelection(false);
  }, [imageOriginalName, imageUrl]);

  useEffect(() => {
    if (!isDialogOpen) {
      resetEditorState();
    }
  }, [isDialogOpen, resetEditorState]);

  useEffect(() => {
    if (!isDialogOpen || !imageSource || !croppedAreaPixels) {
      setPreviewImageSrc(imageSource);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        const blob = await getCroppedImageBlob(imageSource, croppedAreaPixels);
        if (cancelled) return;

        const nextPreviewUrl = URL.createObjectURL(blob);
        safeRevokeObjectUrl(previewObjectUrlRef.current);
        previewObjectUrlRef.current = nextPreviewUrl;
        setPreviewImageSrc(nextPreviewUrl);
      } catch {
        if (!cancelled) {
          setPreviewImageSrc(imageSource);
        }
      }
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [croppedAreaPixels, imageSource, isDialogOpen]);

  useEffect(() => {
    return () => {
      safeRevokeObjectUrl(sourceObjectUrlRef.current);
      safeRevokeObjectUrl(previewObjectUrlRef.current);
    };
  }, []);

  const validateFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(t("pages.profileImage.invalidFile"));
        return false;
      }

      if (file.size > COMPANY_LOGO_MAX_BYTES) {
        toast.error(t("pages.profileImage.fileTooLarge"));
        return false;
      }

      return true;
    },
    [t]
  );

  const applyFile = useCallback(
    (file: File) => {
      if (!validateFile(file)) return;

      safeRevokeObjectUrl(sourceObjectUrlRef.current);
      const nextObjectUrl = URL.createObjectURL(file);
      sourceObjectUrlRef.current = nextObjectUrl;

      setImageSource(nextObjectUrl);
      setPreviewImageSrc(nextObjectUrl);
      setSelectedFileName(file.name);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setCroppedAreaPixels(null);
      setHasLocalSelection(true);
    },
    [validateFile]
  );

  const handleFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      applyFile(file);
      event.target.value = "";
    },
    [applyFile]
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files?.[0];
      if (!file) return;

      applyFile(file);
    },
    [applyFile]
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  }, []);

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const openDialog = useCallback(() => {
    resetEditorState();
    setIsDialogOpen(true);
  }, [resetEditorState]);

  const handleClearSelection = useCallback(() => {
    safeRevokeObjectUrl(sourceObjectUrlRef.current);
    sourceObjectUrlRef.current = null;
    safeRevokeObjectUrl(previewObjectUrlRef.current);
    previewObjectUrlRef.current = null;

    setImageSource(imageUrl);
    setPreviewImageSrc(imageUrl);
    setSelectedFileName(imageOriginalName);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);
    setHasLocalSelection(false);
  }, [imageOriginalName, imageUrl]);

  const handleSave = useCallback(async () => {
    if (!companyId || !imageSource || !croppedAreaPixels) {
      return;
    }

    const toastId = toast.loading(t("pages.profileImage.saving"));
    setIsSubmitting(true);

    try {
      const blob = await getCroppedImageBlob(imageSource, croppedAreaPixels);
      const file = new File([blob], "company-logo.png", {
        type: COMPANY_LOGO_MIME,
      });

      const formData = new FormData();
      formData.append("image", file);

      const { data } = await http.post<UpdateResponse>(`/company/${companyId}/image`, formData);
      await onReload();

      toast.success(traduzMensagemApi(data.message) ?? t("pages.profileImage.savedOk"), {
        id: toastId,
      });

      setIsDialogOpen(false);
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }, [companyId, croppedAreaPixels, imageSource, onReload, t]);

  const handleRemove = useCallback(async () => {
    if (hasLocalSelection) {
      handleClearSelection();
      return;
    }

    if (!companyId || !hasPersistedImage) {
      return;
    }

    const toastId = toast.loading(t("pages.profileImage.removing"));
    setIsSubmitting(true);

    try {
      const { data } = await http.delete<UpdateResponse>(`/company/${companyId}/image`);
      await onReload();

      toast.success(traduzMensagemApi(data.message) ?? t("pages.profileImage.removedOk"), {
        id: toastId,
      });

      setIsDialogOpen(false);
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }, [companyId, handleClearSelection, hasLocalSelection, hasPersistedImage, onReload, t]);

  const canSave = useMemo(() => {
    if (!imageSource || !croppedAreaPixels) return false;
    if (!hasPersistedImage) return true;

    return (
      hasLocalSelection ||
      Math.abs(zoom - 1) > 0.01 ||
      Math.abs(crop.x) > 0.1 ||
      Math.abs(crop.y) > 0.1
    );
  }, [crop.x, crop.y, croppedAreaPixels, hasLocalSelection, hasPersistedImage, imageSource, zoom]);

  const removeActionLabel = hasLocalSelection
    ? t("pages.profileImage.clearSelection")
    : t("pages.profileImage.remove");

  return {
    fileInputRef,
    isDialogOpen,
    isSubmitting,
    imageSource,
    previewImageSrc,
    selectedFileName,
    zoom,
    crop,
    canSave,
    hasPersistedImage,
    removeActionLabel,
    openDialog,
    setIsDialogOpen,
    setZoom,
    setCrop,
    handleCropComplete,
    handleFileInputChange,
    handleDrop,
    handleDragOver,
    handleSelectFileClick: () => fileInputRef.current?.click(),
    handleSave,
    handleRemove,
  };
}

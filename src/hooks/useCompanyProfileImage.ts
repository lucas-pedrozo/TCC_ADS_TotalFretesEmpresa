import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import type { Area, Point } from "react-easy-crop";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/context/AuthContext";
import type { CompanyData } from "@/hooks/useGetCompany";
import http from "@/service/http";
import { getCroppedImageBlob } from "@/utils/cropImage";
import { trataErroAxios, traduzMensagemApi } from "@/utils/trataErroAxios";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

type UpdateResponse = {
  message?: string;
};

type UseCompanyProfileImageParams = {
  companyData: CompanyData | null;
  handleGetCompany: () => Promise<void>;
};

function safeRevokeObjectUrl(url: string | null) {
  if (!url) return;
  URL.revokeObjectURL(url);
}

function buildOutputFileName(fileName?: string) {
  if (!fileName) return "company-profile.png";

  const baseName = fileName.replace(/\.[^.]+$/, "").trim();
  return `${baseName || "company-profile"}.png`;
}

export function useCompanyProfileImage({
  companyData,
  handleGetCompany,
}: UseCompanyProfileImageParams) {
  const { id } = useAuth();
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

  const currentImageUrl = companyData?.image?.url ?? null;
  const currentImageName = companyData?.image?.originalName ?? null;
  const hasPersistedImage = Boolean(currentImageUrl);

  const resetEditorState = useCallback(() => {
    safeRevokeObjectUrl(sourceObjectUrlRef.current);
    sourceObjectUrlRef.current = null;
    safeRevokeObjectUrl(previewObjectUrlRef.current);
    previewObjectUrlRef.current = null;

    setImageSource(currentImageUrl);
    setPreviewImageSrc(currentImageUrl);
    setSelectedFileName(currentImageName);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);
    setHasLocalSelection(false);
  }, [currentImageName, currentImageUrl]);

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

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
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

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handleSelectFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleClearSelection = useCallback(() => {
    safeRevokeObjectUrl(sourceObjectUrlRef.current);
    sourceObjectUrlRef.current = null;
    safeRevokeObjectUrl(previewObjectUrlRef.current);
    previewObjectUrlRef.current = null;

    setImageSource(currentImageUrl);
    setPreviewImageSrc(currentImageUrl);
    setSelectedFileName(currentImageName);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);
    setHasLocalSelection(false);
  }, [currentImageName, currentImageUrl]);

  const handleSave = useCallback(async () => {
    if (!id || !imageSource || !croppedAreaPixels) {
      return;
    }

    const toastId = toast.loading(t("pages.profileImage.saving"));
    setIsSubmitting(true);

    try {
      const blob = await getCroppedImageBlob(imageSource, croppedAreaPixels);
      const file = new File([blob], buildOutputFileName(selectedFileName ?? undefined), {
        type: "image/png",
      });

      const formData = new FormData();
      formData.append("image", file);

      const { data } = await http.post<UpdateResponse>(`/company/${id}/image`, formData);
      await handleGetCompany();

      toast.success(
        traduzMensagemApi(data.message) ?? t("pages.profileImage.savedOk"),
        { id: toastId }
      );

      setIsDialogOpen(false);
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }, [croppedAreaPixels, handleGetCompany, id, imageSource, selectedFileName, t]);

  const handleRemove = useCallback(async () => {
    if (hasLocalSelection) {
      handleClearSelection();
      return;
    }

    if (!id || !hasPersistedImage) {
      return;
    }

    const toastId = toast.loading(t("pages.profileImage.removing"));
    setIsSubmitting(true);

    try {
      const { data } = await http.delete<UpdateResponse>(`/company/${id}/image`);
      await handleGetCompany();

      toast.success(
        traduzMensagemApi(data.message) ?? t("pages.profileImage.removedOk"),
        { id: toastId }
      );

      setIsDialogOpen(false);
    } catch (error) {
      toast.error(trataErroAxios(error), { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    handleClearSelection,
    handleGetCompany,
    hasLocalSelection,
    hasPersistedImage,
    id,
    t,
  ]);

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
    closeDialog,
    setIsDialogOpen,
    setZoom,
    setCrop,
    handleCropComplete,
    handleFileInputChange,
    handleDrop,
    handleDragOver,
    handleSelectFileClick,
    handleSave,
    handleRemove,
  };
}

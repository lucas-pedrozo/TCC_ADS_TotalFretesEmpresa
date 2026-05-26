import { Camera, ImagePlus, Search, Trash2, UploadCloud } from "lucide-react";
import type { ChangeEvent, DragEvent, RefObject } from "react";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type CompanyProfileImageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string;
  imageSource: string | null;
  previewImageSrc: string | null;
  selectedFileName: string | null;
  zoom: number;
  isSubmitting: boolean;
  canSave: boolean;
  removeActionLabel: string;
  hasPersistedImage: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  crop: { x: number; y: number };
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (
    croppedArea: { x: number; y: number; width: number; height: number },
    croppedAreaPixels: { x: number; y: number; width: number; height: number }
  ) => void;
  onFileInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: DragEvent<HTMLLabelElement>) => void;
  onDragOver: (event: DragEvent<HTMLLabelElement>) => void;
  onSelectFileClick: () => void;
  onSave: () => void | Promise<void>;
  onRemove: () => void | Promise<void>;
  t: (key: string) => string;
  getInitials: (name: string) => string;
};

export function CompanyProfileImageDialog({
  open,
  onOpenChange,
  displayName,
  imageSource,
  previewImageSrc,
  selectedFileName,
  zoom,
  isSubmitting,
  canSave,
  removeActionLabel,
  hasPersistedImage,
  fileInputRef,
  crop,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onFileInputChange,
  onDrop,
  onDragOver,
  onSelectFileClick,
  onSave,
  onRemove,
  t,
  getInitials,
}: CompanyProfileImageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-[calc(100vw-1rem)] gap-5 overflow-x-hidden overflow-y-auto rounded-[28px] p-0 shadow-2xl sm:max-h-[calc(100vh-3rem)] sm:max-w-[min(56rem,calc(100vw-2rem))]">
        <DialogHeader className="gap-2 border-b px-6 pt-6 pb-0">
          <DialogTitle className="text-xl font-semibold">
            {t("pages.profileImage.title")}
          </DialogTitle>
          <DialogDescription className="pb-5">
            {t("pages.profileImage.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 px-4 pb-2 sm:px-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <div className="flex flex-col items-center gap-4 rounded-[24px] bg-muted/30 px-5 py-6">
            <Avatar className="size-44 md:size-52">
              {previewImageSrc ? <AvatarImage src={previewImageSrc} alt={displayName} /> : null}
              <AvatarFallback className="bg-brand-green-dark text-4xl font-semibold text-white md:text-5xl">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium text-foreground">
                {t("pages.profileImage.previewLabel")}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedFileName ?? t("pages.profileImage.previewHint")}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={onFileInputChange}
            />

            <label
              className={cn(
                "flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-border bg-muted/20 px-5 py-6 text-center transition-colors",
                "hover:border-brand-green/40 hover:bg-brand-green-light/10"
              )}
              onDrop={onDrop}
              onDragOver={onDragOver}
            >
              <div className="rounded-full bg-background p-3 text-muted-foreground shadow-sm">
                <ImagePlus className="size-5" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  {t("pages.profileImage.dropzoneTitle")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("pages.profileImage.dropzoneHint")}
                </p>
              </div>

              <div className="flex w-full flex-col items-stretch justify-center gap-2 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  type="button"
                  className="w-full rounded-full bg-brand-green-dark text-white hover:bg-brand-green-dark/90 sm:w-auto"
                  onClick={onSelectFileClick}
                  disabled={isSubmitting}
                >
                  <UploadCloud className="size-4" />
                  {t("pages.profileImage.selectFile")}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full text-destructive hover:text-destructive sm:w-auto"
                  onClick={() => void onRemove()}
                  disabled={isSubmitting || (!imageSource && !hasPersistedImage)}
                >
                  <Trash2 className="size-4" />
                  {removeActionLabel}
                </Button>
              </div>
            </label>

            <div className="grid gap-4">
              <div className="relative min-h-64 overflow-hidden rounded-[24px] border bg-muted/20">
                {imageSource ? (
                  <Cropper
                    image={imageSource}
                    crop={crop}
                    zoom={zoom}
                    minZoom={0.5}
                    maxZoom={3}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    objectFit="contain"
                    onCropChange={onCropChange}
                    onCropComplete={onCropComplete}
                    onZoomChange={onZoomChange}
                  />
                ) : (
                  <div className="flex min-h-64 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
                    <Camera className="size-5" />
                    <p>{t("pages.profileImage.emptyEditor")}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-[24px] border bg-background px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <Search className="size-4" />
                    {t("pages.profileImage.zoom")}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {zoom.toFixed(2)}x
                  </span>
                </div>

                <input
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(event) => onZoomChange(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer accent-brand-green-dark"
                  disabled={!imageSource || isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-5">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("pages.profileImage.cancel")}
          </Button>
          <Button
            type="button"
            className="rounded-full bg-brand-green-dark text-white hover:bg-brand-green-dark/90"
            onClick={() => void onSave()}
            disabled={!canSave || isSubmitting}
          >
            {isSubmitting
              ? t("pages.profileImage.saving")
              : t("pages.profileImage.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

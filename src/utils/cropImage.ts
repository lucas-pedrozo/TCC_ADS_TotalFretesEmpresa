import {
  COMPANY_LOGO_HEIGHT,
  COMPANY_LOGO_MIME,
  COMPANY_LOGO_WIDTH,
} from "@/constants/companyLogo";

export type CropAreaPixels = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type GetCroppedImageBlobOptions = {
  outputWidth?: number;
  outputHeight?: number;
  mimeType?: string;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("CROP_IMAGE_LOAD_FAILED"));
    image.src = src;
  });
}

export async function getCroppedImageBlob(
  imageSrc: string,
  crop: CropAreaPixels,
  options: GetCroppedImageBlobOptions = {}
): Promise<Blob> {
  const {
    outputWidth = COMPANY_LOGO_WIDTH,
    outputHeight = COMPANY_LOGO_HEIGHT,
    mimeType = COMPANY_LOGO_MIME,
  } = options;

  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("CROP_IMAGE_CONTEXT_UNAVAILABLE");
  }

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("CROP_IMAGE_EXPORT_FAILED"));
        return;
      }

      resolve(blob);
    }, mimeType);
  });
}

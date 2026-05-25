export type CropAreaPixels = {
  x: number;
  y: number;
  width: number;
  height: number;
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
  mimeType = "image/png"
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;

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
    crop.width,
    crop.height
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

const MAX_DIMENSION = 2048;
const COMPRESS_QUALITY = 0.85;

/**
 * Compresses an image if it exceeds the size limit.
 * Resizes to max 2048px on the longest side and outputs JPEG at 0.85 quality.
 * Returns the original data URL if the image is already small enough.
 */
export async function compressImage(dataUrl: string, maxBytes: number = 8 * 1024 * 1024): Promise<string> {
  // Quick check: estimate the decoded size from the base64 length
  const base64Part = dataUrl.split(',')[1] ?? '';
  const estimatedSize = (base64Part.length * 3) / 4;
  if (estimatedSize <= maxBytes) return dataUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Scale down if either dimension exceeds the max
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', COMPRESS_QUALITY));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Client-side underwater image enhancement using Canvas API.
 * Applies Gray World white balance to remove blue/green color cast,
 * boosts contrast, and slightly increases brightness to counter underwater haze.
 */

export async function enhanceUnderwaterImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl); // fallback to original
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const pixelCount = data.length / 4;

      // Step 1: Compute average R, G, B for Gray World white balance
      let sumR = 0, sumG = 0, sumB = 0;
      for (let i = 0; i < data.length; i += 4) {
        sumR += data[i];
        sumG += data[i + 1];
        sumB += data[i + 2];
      }
      const avgR = sumR / pixelCount;
      const avgG = sumG / pixelCount;
      const avgB = sumB / pixelCount;
      const avgAll = (avgR + avgG + avgB) / 3;

      // Step 2: Correction factors — normalize channels to remove color cast
      const rFactor = avgR > 0 ? avgAll / avgR : 1;
      const gFactor = avgG > 0 ? avgAll / avgG : 1;
      const bFactor = avgB > 0 ? avgAll / avgB : 1;

      // Step 3: Apply white balance + contrast (1.2x) + brightness (+8)
      const contrast = 1.2;
      const brightness = 8;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i] * rFactor;
        let g = data[i + 1] * gFactor;
        let b = data[i + 2] * bFactor;

        r = (r - 128) * contrast + 128 + brightness;
        g = (g - 128) * contrast + 128 + brightness;
        b = (b - 128) * contrast + 128 + brightness;

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => reject(new Error('Failed to load image for enhancement'));
    img.src = dataUrl;
  });
}

/**
 * Converts a data URL to a File object suitable for FormData.
 */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i);
  }
  return new File([arr], filename, { type: mime });
}
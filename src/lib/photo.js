/**
 * Utilitas kompresi foto di sisi klien menggunakan Canvas API bawaan browser.
 * Tanpa dependency eksternal.
 */

const MAX_WIDTH = 1280;
const MAX_HEIGHT = 1280;
const DEFAULT_QUALITY = 0.7;

/** Deteksi apakah browser mendukung WebP output dari canvas. */
function supportsWebP() {
  try {
    return document.createElement('canvas')
      .toDataURL('image/webp')
      .startsWith('data:image/webp');
  } catch {
    return false;
  }
}

/**
 * Kompres file gambar di sisi klien menggunakan Canvas.
 * @param {File} file - File dari <input type="file" accept="image/*">
 * @param {{ maxWidth?: number, maxHeight?: number, quality?: number }} [opts]
 * @returns {Promise<File>} File terkompresi dengan nama <uuid>.webp atau <uuid>.jpg
 */
export async function compressPhoto(
  file,
  { maxWidth = MAX_WIDTH, maxHeight = MAX_HEIGHT, quality = DEFAULT_QUALITY } = {}
) {
  if (!file.type.startsWith('image/')) {
    throw new Error('File harus berupa gambar (JPEG, PNG, WebP, dll).');
  }

  const bitmap = await createImageBitmap(file);

  // Hitung dimensi dengan menjaga aspect ratio
  let { width, height } = bitmap;
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const useWebP = supportsWebP();
  const mimeType = useWebP ? 'image/webp' : 'image/jpeg';
  const ext = useWebP ? 'webp' : 'jpg';

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error('Gagal mengompres gambar.')); return; }
        const name = `${crypto.randomUUID()}.${ext}`;
        resolve(new File([blob], name, { type: mimeType }));
      },
      mimeType,
      quality
    );
  });
}

/**
 * Konversi File ke data URL untuk pratinjau di UI.
 * @param {File} file
 * @returns {Promise<string>}
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
}

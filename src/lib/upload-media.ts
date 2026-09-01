/**
 * Shared client-side media upload helper.
 *
 * Design goals (photography portal):
 *  1. The ORIGINAL file is always uploaded byte-for-byte — the master is never
 *     re-encoded, so no quality is lost.
 *  2. An optional high-quality display variant (max 2560px, q=0.92) is produced
 *     separately and stored alongside as the gallery thumbnail. Grids load the
 *     lighter variant; lightbox/detail keeps using the master.
 *  3. Videos are never processed client-side — original bytes only.
 *  4. Uploads run with bounded concurrency for noticeably faster batches.
 */

export type SignedUpload = { path: string; token: string; signedUrl: string };
export type GetUploadUrl = (args: {
  data: { filename: string; contentType: string };
}) => Promise<SignedUpload>;

export type StorageUploader = (
  upload: SignedUpload,
  file: Blob,
  contentType: string,
) => Promise<void>;

export type UploadedMedia = {
  file: File;
  /** Master (original bytes) stable URL. */
  masterUrl: string;
  /** Optional optimized display variant URL (empty when not generated). */
  displayUrl: string;
  mediaType: "image" | "video";
};

const MAX_DISPLAY_EDGE = 2560;
const DISPLAY_QUALITY = 0.92;
/** Below this size the original is already light enough to serve directly. */
const VARIANT_MIN_BYTES = 1_200_000;

/** iPhone files sometimes arrive with an empty MIME type — infer from extension. */
export function resolveContentType(file: File) {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "heic":
      return "image/heic";
    case "heif":
      return "image/heif";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "mov":
      return "video/quicktime";
    case "mp4":
      return "video/mp4";
    default:
      return "application/octet-stream";
  }
}

export function isVideoFile(file: File) {
  return resolveContentType(file).startsWith("video");
}

/**
 * Decode + downscale to a high-quality JPEG display copy.
 * Returns null when the browser cannot decode the format (e.g. HEIC outside
 * Safari) or when the original is already small enough.
 */
export async function makeDisplayVariant(file: File): Promise<Blob | null> {
  const type = resolveContentType(file);
  if (!type.startsWith("image")) return null;
  if (file.size < VARIANT_MIN_BYTES) return null;
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") return null;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DISPLAY_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale >= 1 && file.size < VARIANT_MIN_BYTES * 2) {
      bitmap.close?.();
      return null;
    }
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", DISPLAY_QUALITY),
    );
    if (!blob || blob.size >= file.size) return null;
    return blob;
  } catch {
    // HEIC/HEIF or corrupt file the browser cannot decode — keep original only.
    return null;
  }
}

/** Run tasks with bounded concurrency, preserving result order. */
async function pool<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>) {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i]!, i);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function uploadMediaFiles({
  files,
  getUploadUrl,
  upload,
  concurrency = 4,
  generateDisplayVariant = true,
  onProgress,
}: {
  files: File[];
  getUploadUrl: GetUploadUrl;
  upload: StorageUploader;
  concurrency?: number;
  generateDisplayVariant?: boolean;
  onProgress?: (done: number, total: number, label: string) => void;
}): Promise<UploadedMedia[]> {
  let done = 0;
  const total = files.length;
  onProgress?.(0, total, `Uploading ${total} file${total === 1 ? "" : "s"}…`);

  return pool(files, concurrency, async (file) => {
    const contentType = resolveContentType(file);
    const video = contentType.startsWith("video");

    // Master: original bytes, never re-encoded.
    const masterTarget = await getUploadUrl({ data: { filename: file.name, contentType } });
    const masterPromise = upload(masterTarget, file, contentType);

    let displayUrl = "";
    if (!video && generateDisplayVariant) {
      const variant = await makeDisplayVariant(file);
      if (variant) {
        const base = file.name.replace(/\.[a-z0-9]+$/i, "");
        const target = await getUploadUrl({
          data: { filename: `${base}-display.jpg`, contentType: "image/jpeg" },
        });
        await upload(target, variant, "image/jpeg");
        displayUrl = target.signedUrl;
      }
    }

    await masterPromise;
    done += 1;
    onProgress?.(done, total, `Uploaded ${done} of ${total}…`);

    return {
      file,
      masterUrl: masterTarget.signedUrl,
      displayUrl,
      mediaType: video ? ("video" as const) : ("image" as const),
    };
  });
}

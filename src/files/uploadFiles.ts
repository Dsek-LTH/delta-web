import { fileHandler } from "@/files";
import sharp, { type ResizeOptions, type WebpOptions } from "sharp";
import type { APIContext } from "astro";
import { getNameOfFile, prepareNameForFilesystem } from "@/files/utils";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 25_000_000;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const ALLOWED_IMAGE_FORMATS = new Set(["jpeg", "png", "webp"]);

export const compressImage = async (
  image: Buffer,
  options?: {
    resize?: ResizeOptions;
    webp?: WebpOptions;
  },
) =>
  await sharp(image, { limitInputPixels: MAX_IMAGE_PIXELS })
    // this is required to keep the image upright
    .rotate()
    .resize({
      fit: "cover",
      withoutEnlargement: true,
      ...options?.resize,
    })
    // save as webp
    .webp(options?.webp)
    .toBuffer();

export type CompressionOptions = Parameters<typeof compressImage>[1];

export const uploadFile = async (
  context: APIContext,
  file: File,
  prefix: string,
  bucket: string,
  name?: string,
  compressionOptions?: CompressionOptions | false, // false means no compression, undefined is default compression (for images only of course)
) => {
  let formattedName = prepareNameForFilesystem(
    name ?? getNameOfFile(file.name),
    file.name,
  );

  let dataToUpload: File | Uint8Array<ArrayBuffer> = file;
  if (compressionOptions !== false) {
    if (
      file.size > MAX_IMAGE_SIZE_BYTES ||
      !ALLOWED_IMAGE_MIME_TYPES.has(file.type)
    ) {
      throw new Error(
        "The uploaded image must be a JPEG, PNG, or WebP file smaller than 10 MB.",
      );
    }

    try {
      const imageBuffer = Buffer.from(await file.arrayBuffer());
      const metadata = await sharp(imageBuffer, {
        limitInputPixels: MAX_IMAGE_PIXELS,
      }).metadata();

      if (!metadata.format || !ALLOWED_IMAGE_FORMATS.has(metadata.format)) {
        throw new Error("The uploaded file is not a supported image.");
      }

      dataToUpload = Uint8Array.from(
        await compressImage(imageBuffer, compressionOptions),
      );
      formattedName = prepareNameForFilesystem(
        name ?? getNameOfFile(file.name),
        file.name,
        "webp",
      );
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      throw new Error(`Could not compress image: ${errMsg}`);
    }
  }

  const filePath = `${prefix}/${formattedName}`;

  try {
    const putUrl = await fileHandler.getPresignedPutUrl(
      context,
      bucket,
      filePath,
      true,
    );
    const res = await fetch(putUrl, {
      method: "PUT",
      body: dataToUpload,
    });
    if (!res.ok) throw new Error(`Could not upload file: ${await res.text()}`);
    return `minio/${bucket}/${filePath}`;
  } catch (e) {
    console.error(e);
    const errMsg = e instanceof Error ? e.message : String(e);
    throw new Error(`Could not upload file: ${errMsg}`);
  }
};

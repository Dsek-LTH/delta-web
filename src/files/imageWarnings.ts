import { z } from "astro/zod";

export const imageWarningCodes = [
  "too-large",
  "unsupported",
  "unknown",
] as const;

export type ImageWarningCode = (typeof imageWarningCodes)[number];

export class ImageUploadError extends Error {
  readonly code: ImageWarningCode;

  constructor(code: ImageWarningCode, message: string) {
    super(message);
    this.name = "ImageUploadError";
    this.code = code;
  }
}

const imageWarningSchema = z.enum(imageWarningCodes);

export const imageWarningFromError = (error: unknown): ImageWarningCode =>
  error instanceof ImageUploadError ? error.code : "unknown";

export const imageWarningFromQuery = (
  value: string | null,
): ImageWarningCode | null =>
  imageWarningSchema.safeParse(value).success
    ? (value as ImageWarningCode)
    : null;

export const withImageWarning = (href: string, warning?: ImageWarningCode) => {
  if (!warning) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}${new URLSearchParams({ imageWarning: warning })}`;
};

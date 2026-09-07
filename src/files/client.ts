import { env } from "@/envvars";

export const MINIO_BASE_URL = (() => {
  if (env.MINIO_PORT === "443") return `https://${env.MINIO_ENDPOINT}/`;
  if (env.MINIO_PORT === "80") return `http://${env.MINIO_ENDPOINT}/`;
  return `http${
    env.MINIO_USE_SSL === "true" ? "s" : ""
  }://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/`;
})();

export const getFileUrl = (imageUrl: string | null | undefined) => {
  if (!imageUrl) return imageUrl;
  if (imageUrl.startsWith("minio/")) {
    return `${MINIO_BASE_URL}${imageUrl.substring(6)}`;
  }
  return imageUrl;
};

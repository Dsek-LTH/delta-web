import { env } from "@/envvars";
import { Client } from "minio";

if (!env.MINIO_PASSWORD) {
  console.warn(
    "MINIO_PASSWORD is unset — running anonymously. Uploads and object deletion may fail.",
  );
}

const minio = new Client({
  endPoint: env.MINIO_ENDPOINT || "minio-sandbox.dsek.se",
  port: env.MINIO_PORT
    ? Number.parseInt(env.MINIO_PORT, 10)
    : env.MINIO_USE_SSL === "true"
      ? 443
      : 80,
  useSSL: env.MINIO_USE_SSL === "true",
  accessKey: env.MINIO_USERNAME || "DsekMinioSandboxUser",
  secretKey: env.MINIO_PASSWORD || "",
});

export { CopyConditions } from "minio";
export default minio;

import { env } from "@/envvars";
import { Client } from "minio";

const minio = new Client({
  endPoint: env.MINIO_ENDPOINT || "https://minio-sandbox.dsek.se",
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

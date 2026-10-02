import { env } from "@/envvars";
import DefaultProfilePicture from "@/assets/default-profile.webp";
import minio from "@/files/minio";
import { prepareNameForFilesystem } from "./utils";

export const MINIO_BASE_URL = (() => {
  if (env.MINIO_PORT === "443") return `https://${env.MINIO_ENDPOINT}/`;
  if (env.MINIO_PORT === "80") return `http://${env.MINIO_ENDPOINT}/`;
  return `http${
    env.MINIO_USE_SSL === "true" ? "s" : ""
  }://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/`;
})();

export const checkMemberImageExists = async (member: {
  studentId: string;
}): Promise<boolean> => {
  const bucket = env.MINIO_BUCKET_PUBLIC || "delta-public";
  const objectName = `delta-force-members/${prepareNameForFilesystem(member.studentId, member.studentId, "webp")}`;

  try {
    await minio.statObject(bucket, objectName);
    const url = `${MINIO_BASE_URL}${bucket}/${objectName}`;
    if (!url) {
      return false;
    }
    return true;
  } catch (err: any) {
    if (
      err.code === "NotFound" ||
      err.code === "NoSuchKey" ||
      err.statusCode === 404
    ) {
      return false;
    }

    console.error(`Unexpected MinIO error for ${objectName}:`, err);
    throw err;
  }
};

export const getMemberImage = async (member: {
  studentId: string;
}): Promise<ImageMetadata> => {
  const bucket = env.MINIO_BUCKET_PUBLIC || "delta-public";
  const objectName = `delta-force-members/${prepareNameForFilesystem(member.studentId, member.studentId, "webp")}`;

  try {
    await minio.statObject(bucket, objectName);
    const url = `${MINIO_BASE_URL}${bucket}/${objectName}`;
    if (!url) {
      return DefaultProfilePicture;
    }
    return {
      src: url,
      width: 800,
      height: 800,
      format: "webp",
    };
  } catch (err: any) {
    if (
      err.code === "NotFound" ||
      err.code === "NoSuchKey" ||
      err.statusCode === 404
    ) {
      return DefaultProfilePicture;
    }

    console.error(`Unexpected MinIO error for ${objectName}:`, err);
    throw err;
  }
};

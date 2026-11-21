import { env } from "@/envvars";
import DefaultProfilePicture from "@/assets/default-profile.webp";
import minio from "@/files/minio";

export const MINIO_BASE_URL = (() => {
  if (env.MINIO_PORT === "443") return `https://${env.MINIO_ENDPOINT}/`;
  if (env.MINIO_PORT === "80") return `http://${env.MINIO_ENDPOINT}/`;
  if (env.MINIO_PORT)
    return `http${
      env.MINIO_USE_SSL === "true" ? "s" : ""
    }://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/`;
  else
    return `http${env.MINIO_USE_SSL === "true" ? "s" : ""}://${env.MINIO_ENDPOINT}:443/`;
})();

export const publicBucket = () => env.MINIO_BUCKET_PUBLIC || "delta-public";

export const getMemberImageObjectName = (studentId: string) =>
  `delta-force-members/${studentId}.webp`;

export const getAttendeeImageObjectName = (id: number) =>
  `attendees/${id}.webp`;

const isNotFoundError = (err: any) =>
  err?.code === "NotFound" ||
  err?.code === "NoSuchKey" ||
  err?.statusCode === 404;

const imageExists = async (
  bucket: string,
  objectName: string,
): Promise<boolean> => {
  try {
    await minio.statObject(bucket, objectName);
    return true;
  } catch (err: any) {
    if (isNotFoundError(err)) {
      return false;
    }

    console.error(`Unexpected MinIO error for ${objectName}:`, err);
    throw new Error(`Unexpected MinIO error for ${objectName}: ${err.message}`);
  }
};

export const getGroupImages = async (): Promise<Record<string, string>> => {
  const bucket = publicBucket();
  const prefix = "delta-force-groups/";
  const images: Record<string, string> = {};

  try {
    for await (const object of minio.listObjectsV2(bucket, prefix, true)) {
      if (!object.name?.endsWith(".webp")) continue;
      const name = object.name.slice(prefix.length).replace(/\.webp$/, "");
      images[name] =
        `${MINIO_BASE_URL}${bucket}/${object.name}?v=${object.lastModified.getTime()}`;
    }
  } catch (err: any) {
    console.error(`Unexpected MinIO error listing ${prefix}:`, err);
  }

  return images;
};

const getImage = async (
  bucket: string,
  objectName: string,
): Promise<ImageMetadata> => {
  try {
    const stat = await minio.statObject(bucket, objectName);
    return {
      src: `${MINIO_BASE_URL}${bucket}/${objectName}?v=${stat.lastModified.getTime()}`,
      width: 800,
      height: 800,
      format: "webp",
    };
  } catch (err: any) {
    if (isNotFoundError(err)) {
      return DefaultProfilePicture;
    }

    console.error(`Unexpected MinIO error for ${objectName}:`, err);
    return DefaultProfilePicture;
  }
};

export const checkMemberImageExists = async (member: {
  studentId: string;
}): Promise<boolean> =>
  imageExists(publicBucket(), getMemberImageObjectName(member.studentId));

export const getMemberImage = async (member: {
  studentId: string;
}): Promise<ImageMetadata> =>
  getImage(publicBucket(), getMemberImageObjectName(member.studentId));

export const getAttendeeImage = async (attendee: {
  id: number;
}): Promise<ImageMetadata> =>
  getImage(publicBucket(), getAttendeeImageObjectName(attendee.id));

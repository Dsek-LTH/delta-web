import { env } from "@/envvars";
import DefaultProfilePicture from "@/assets/default-profile.webp";
import minio from "@/files/minio";
import { prepareNameForFilesystem } from "./utils";

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

const publicBucket = () => env.MINIO_BUCKET_PUBLIC || "delta-public";

const getMemberImageObjectName = (studentId: string) =>
  `delta-force-members/${prepareNameForFilesystem(studentId, studentId, "webp")}`;

const getAttendeeImageObjectName = (id: number) =>
  `attendees/${prepareNameForFilesystem(id.toString(), id.toString(), "webp")}`;

const getGroupPhotoObjectName = (group: string) =>
  `delta-force-groups/${prepareNameForFilesystem(group, group, "webp")}`;

const imageExists = async (
  bucket: string,
  objectName: string,
): Promise<boolean> => {
  try {
    await minio.statObject(bucket, objectName);
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
    throw new Error(`Unexpected MinIO error for ${objectName}: ${err.message}`);
  }
};

const getImage = async (
  bucket: string,
  objectName: string,
): Promise<ImageMetadata> => {
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

export const checkAttendeeImageExists = async (attendee: {
  id: number;
}): Promise<boolean> =>
  imageExists(publicBucket(), getAttendeeImageObjectName(attendee.id));

export const getAttendeeImage = async (attendee: {
  id: number;
}): Promise<ImageMetadata> =>
  getImage(publicBucket(), getAttendeeImageObjectName(attendee.id));

export const getGroupPhotoUrl = async (
  group: string,
): Promise<string | null> => {
  const bucket = publicBucket();
  const objectName = getGroupPhotoObjectName(group);

  try {
    const stat = await minio.statObject(bucket, objectName);
    return `${MINIO_BASE_URL}${bucket}/${objectName}?v=${stat.lastModified.getTime()}`;
  } catch (err: any) {
    if (
      err.code === "NotFound" ||
      err.code === "NoSuchKey" ||
      err.statusCode === 404
    ) {
      return null;
    }

    console.error(`Unexpected MinIO error for ${objectName}:`, err);
    return null;
  }
};

import { fileExists, isDir } from "@/files/helpers";
import { MINIO_BASE_URL } from "@/files/client";
import minio, { CopyConditions } from "@/files/minio";
import { authorize } from "@/auth/authorize";

import path from "path";

export type FileData = {
  id: string;
  name: string;
  modDate?: Date;
  size?: number;
  thumbnailUrl?: string;
  isDir?: boolean;
};

const getFilesInFolder = async (
  bucket: string,
  prefix: string,
  recursive: boolean,
): Promise<FileData[]> => {
  return new Promise<FileData[]>((resolve, reject) => {
    const stream = minio.listObjectsV2(bucket, prefix, recursive);
    const files: FileData[] = [];
    stream.on("data", (obj) => {
      if (obj.name) {
        files.push({
          id: obj.name,
          name: path.basename(obj.name),
          modDate: obj.lastModified,
          size: obj.size,
          thumbnailUrl: `${MINIO_BASE_URL}${bucket}/${obj.name}`,
        });
      }
      if (obj.prefix) {
        files.push({
          id: obj.prefix,
          name: path.basename(obj.prefix),
          isDir: true,
        });
      }
    });
    stream.on("error", reject);
    stream.on("end", () => {
      resolve(files);
    });
  });
};

const getFilesInBucket = async (
  headers: Headers | undefined,
  bucket: string,
  prefix: string,
  recursive = false,
): Promise<FileData[]> => {
  if (!bucket) {
    return Promise.resolve([]);
  }
  authorize(headers);
  const basePath = "";
  const files = (
    await getFilesInFolder(
      bucket,
      prefix !== "/" ? basePath + prefix : basePath,
      recursive,
    )
  ).filter((file) => file.name !== "_folder-preserver");
  return files;
};

const ONE_HOUR_IN_SECONDS = 60 * 60;
const getPresignedPutUrl = async (
  headers: Headers | undefined,
  bucket: string,
  fileName: string,
  allowOverwrite = false,
): Promise<string> => {
  authorize(headers);
  if (fileName === "") throw new Error("File name cannot be empty");

  if (!allowOverwrite && (await fileExists(bucket, fileName))) {
    throw new Error(`File ${fileName} already exists`);
  }
  const url = await minio.presignedPutObject(
    bucket,
    fileName,
    ONE_HOUR_IN_SECONDS,
  );
  return url;
};

// Returns deleted files data
const removeFileGivenPath = async (
  headers: Headers | undefined,
  bucket: string,
  filePath: string,
): Promise<FileData[]> => {
  const filesInFolder = await getFilesInFolder(bucket, filePath, true);
  if (filesInFolder.length > 1) {
    await minio.removeObjects(
      bucket,
      filesInFolder.map((file) => file.id),
    );
    return filesInFolder.map((file) => ({
      id: file.id,
      name: path.basename(file.id),
    }));
  } else if (filesInFolder.length === 1) {
    const file = filesInFolder[0]!;
    await minio.removeObject(bucket, file.id);
    return [
      {
        id: file.id,
        name: path.basename(file.id),
      },
    ];
  } else {
    // file not found
    return [];
  }
};
/**
 * As the name implies this removes an object from the storage without checking any valid access, make sure to check access before calling this function
 */
export const removeFilesWithoutAccessCheck = async (
  headers: Headers | undefined,
  bucket: string,
  fileNames: string[],
): Promise<FileData[]> => {
  const deleted: FileData[] = [];

  try {
    await Promise.all(
      fileNames.map(async (fileName) => {
        const deltedForFilePath = await removeFileGivenPath(
          headers,
          bucket,
          fileName,
        );
        deleted.push(...deltedForFilePath);
      }),
    );
  } catch (e) {
    if (e instanceof Error)
      throw new Error(`Could not remove file, ${e.message}`);
    throw e;
  }
  return deleted;
};

const removeObjects = async (
  headers: Headers | undefined,
  bucket: string,
  fileNames: string[],
) => {
  authorize(headers);
  await removeFilesWithoutAccessCheck(headers, bucket, fileNames);
};

type FileChange = {
  file: FileData;
  oldFile?: FileData;
};
const moveObject = async (
  headers: Headers | undefined,
  bucket: string,
  fileNames: string[],
  newFolder: string,
) => {
  authorize(headers);
  const moved: FileChange[] = [];

  await Promise.all(
    fileNames.map(async (fileName) => {
      const basename = path.basename(fileName);

      if (isDir(fileName)) {
        const filesInFolder = await getFilesInBucket(headers, bucket, fileName);
        if (filesInFolder) {
          const recursivedMoved = await moveObject(
            headers,
            bucket,
            filesInFolder.map((file) => file.id),
            `${newFolder + basename}/`,
          );
          const FileChange = {
            file: {
              id: `${newFolder + basename}/`,
              name: basename,
              isDir: true,
            },
            oldFile: { id: fileName, name: basename, isDir: true },
          };
          moved.push(FileChange);
          moved.push(...recursivedMoved);
        }
      } else {
        const newFileName = path.join(newFolder, basename);

        const objectStats = await minio.statObject(bucket, fileName);

        if (await fileExists(bucket, newFileName)) {
          return;
        }

        const oldFile = {
          id: fileName,
          name: path.basename(fileName),
          modDate: objectStats.lastModified,
          size: objectStats.size,
          thumbnailUrl: `${MINIO_BASE_URL}${bucket}/${fileName}`,
        };

        const newFile = {
          id: newFileName,
          name: path.basename(newFileName),
          size: objectStats.size,
          thumbnailUrl: `${MINIO_BASE_URL}${bucket}/${newFileName}`,
        };

        await minio.copyObject(
          bucket,
          newFileName,
          `/${bucket}/${fileName}`,
          new CopyConditions(),
        );
        await minio.removeObject(bucket, fileName);

        const FileChange = {
          file: newFile,
          oldFile,
        };

        moved.push(FileChange);
      }
    }),
  );
  return moved;
};

const renameObject = async (
  headers: Headers | undefined,
  bucket: string,
  fileName: string,
  newFileName: string,
) => {
  authorize(headers);
  if (await fileExists(bucket, newFileName)) {
    throw new Error(`File ${newFileName} already exists`);
  }
  const dirname = path.dirname(fileName);

  if (isDir(fileName)) {
    const filesInFolder = await getFilesInBucket(headers, bucket, fileName);
    if (filesInFolder) {
      await moveObject(
        headers,
        bucket,
        filesInFolder.map((file) => file.id),
        `${newFileName}/`,
      );
    }
    return undefined;
  }
  const newFileId = path.join(`${dirname}/`, newFileName);

  const objectStats = await minio.statObject(bucket, fileName);

  if (await fileExists(bucket, newFileId)) {
    return undefined;
  }

  const oldFile = {
    id: fileName,
    name: path.basename(fileName),
    modDate: objectStats.lastModified,
    size: objectStats.size,
    thumbnailUrl: `${MINIO_BASE_URL}${bucket}/${fileName}`,
  };

  const newFile = {
    id: newFileId,
    name: path.basename(newFileId),
    size: objectStats.size,
    thumbnailUrl: `${MINIO_BASE_URL}${bucket}/${newFileId}`,
  };

  await minio.copyObject(
    bucket,
    newFileName,
    `/${bucket}/${fileName}`,
    new CopyConditions(),
  );
  await minio.removeObject(bucket, fileName);

  const FileChange = {
    file: newFile,
    oldFile,
  };

  return FileChange;
};
const fileHandler = {
  getInBucket: getFilesInBucket,
  getPresignedPutUrl,
  remove: removeObjects,
  move: moveObject,
  rename: renameObject,
};
export default fileHandler;

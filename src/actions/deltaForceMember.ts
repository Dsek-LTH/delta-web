import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { deltaForceRoles } from "@/constants";
import { db } from "@/db/connect";
import { deltaForceTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { uploadFile } from "@/files/uploadFiles";
import { env } from "@/envvars";
import type { APIContext } from "astro";
import fileHandler from "@/files/fileHandler";
import { checkMemberImageExists } from "@/files/client";
import { prepareNameForFilesystem } from "@/files/utils";

const optionalImage = z.preprocess(
  (value) => (value instanceof File && value.size === 0 ? undefined : value),
  z
    .instanceof(File)
    .refine((f) => f.size > 0)
    .optional(),
);

const studentIdRegex = /^[a-z]{2}[0-9]{4}[a-z]{2}(-s)$/;

export const deltaForceMember = {
  updateDeltaForceMember: defineAction({
    accept: "form",
    input: z.object({
      lang: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      oldStudentId: z.string().regex(studentIdRegex),
      studentId: z.string().regex(studentIdRegex),
      role: z.enum(deltaForceRoles),
      email: z.email(),
      linkedin: z.url(),
      image: optionalImage,
    }),
    handler: async (input, context) => {
      console.log("Updating member:", input.studentId);
      if (
        input.oldStudentId !== input.studentId &&
        (await checkMemberImageExists({ studentId: input.oldStudentId }))
      ) {
        if (input.image) {
          try {
            await fileHandler.remove(
              context as APIContext,
              env.MINIO_BUCKET_PUBLIC || "delta-public",
              [
                `delta-force-members/${prepareNameForFilesystem(input.oldStudentId, input.oldStudentId, "webp")}`,
              ],
            );
          } catch (error) {
            console.error(
              `Failed to delete image for studentId ${input.studentId}: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        } else {
          try {
            const res = await fileHandler.rename(
              context as APIContext,
              env.MINIO_BUCKET_PUBLIC || "delta-public",
              `delta-force-members/${prepareNameForFilesystem(input.oldStudentId, input.oldStudentId, "webp")}`,
              `delta-force-members/${prepareNameForFilesystem(input.studentId, input.studentId, "webp")}`,
            );
            if (!res) {
              console.error(
                `Failed to rename image for studentId ${input.oldStudentId} to ${input.studentId}: No response from fileHandler.rename`,
              );
            }
          } catch (error) {
            console.error(
              `Failed to rename old image for studentId ${input.oldStudentId}: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        }
      }
      if (input.image) {
        try {
          await uploadFile(
            context as APIContext,
            input.image,
            "delta-force-members",
            env.MINIO_BUCKET_PUBLIC || "delta-public",
            `${input.studentId}`,
            {
              resize: {
                width: 800,
                height: 800,
                fit: "cover",
              },
              webp: {
                quality: 80,
              },
            },
          );
        } catch (error) {
          console.error(
            `Failed to upload new image for studentId ${input.studentId}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
      try {
        await db
          .update(deltaForceTable)
          .set({
            firstName: input.firstName,
            lastName: input.lastName,
            studentId: input.studentId,
            role: input.role,
            email: input.email,
            linkedin: input.linkedin,
          })
          .where(eq(deltaForceTable.studentId, input.oldStudentId))
          .run();
      } catch (error) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update member with studentId ${input.oldStudentId}: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
      return { studentId: input.studentId };
    },
  }),
  addDeltaForceMember: defineAction({
    accept: "form",
    input: z.object({
      lang: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      studentId: z.string().regex(studentIdRegex),
      role: z.enum(deltaForceRoles),
      email: z.email(),
      linkedin: z.url(),
      image: optionalImage,
    }),
    handler: async (input, context) => {
      console.log("Adding new member:", input.studentId);
      if (input.image) {
        try {
          await uploadFile(
            context as APIContext,
            input.image,
            "delta-force-members",
            env.MINIO_BUCKET_PUBLIC || "delta-public",
            `${input.studentId}`,
            {
              resize: {
                width: 800,
                height: 800,
                fit: "cover",
              },
              webp: {
                quality: 80,
              },
            },
          );
        } catch (error) {
          console.error(
            `Failed to upload new image for studentId ${input.studentId}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
      try {
        await db
          .insert(deltaForceTable)
          .values({
            firstName: input.firstName,
            lastName: input.lastName,
            studentId: input.studentId,
            role: input.role,
            email: input.email,
            linkedin: input.linkedin,
          })
          .run();
      } catch (error) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to add new member with studentId ${input.studentId}: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
      return { studentId: input.studentId };
    },
  }),
  deleteDeltaForceMember: defineAction({
    accept: "form",
    input: z.object({
      studentId: z.string().regex(studentIdRegex),
    }),
    handler: async (input, context) => {
      console.log("Deleting member with studentId:", input.studentId);
      if (await checkMemberImageExists(input)) {
        try {
          await fileHandler.remove(
            context as APIContext,
            env.MINIO_BUCKET_PUBLIC || "delta-public",
            [
              `delta-force-members/${prepareNameForFilesystem(input.studentId, input.studentId, "webp")}`,
            ],
          );
        } catch (error) {
          console.error(
            `Failed to delete image for studentId ${input.studentId}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
      try {
        await db
          .delete(deltaForceTable)
          .where(eq(deltaForceTable.studentId, input.studentId))
          .run();
      } catch (error) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete member with studentId ${input.studentId}: ${error instanceof Error ? error.message : String(error)}`,
        });
      }

      return { studentId: input.studentId };
    },
  }),
};

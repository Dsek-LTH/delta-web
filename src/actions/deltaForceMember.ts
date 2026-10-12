import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { deltaForceRoles } from "@/constants";
import { db } from "@/db/connect";
import { deltaForceTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  optionalImage,
  profileImageCompression,
  uploadFile,
} from "@/files/uploadFiles";
import fileHandler from "@/files/fileHandler";
import {
  checkMemberImageExists,
  getMemberImageObjectName,
  publicBucket,
} from "@/files/client";
import type { AuthContext } from "@/auth/authorize";
import {
  imageWarningFromError,
  type ImageWarningCode,
} from "@/files/imageWarnings";

const studentIdRegex = /^[a-z]{2}[0-9]{4}[a-z]{2}(-s)$/;

const uploadMemberImage = async (
  context: AuthContext,
  image: File,
  studentId: string,
): Promise<ImageWarningCode | undefined> => {
  try {
    await uploadFile(
      context,
      image,
      "delta-force-members",
      publicBucket(),
      studentId,
      profileImageCompression,
    );
  } catch (error) {
    console.error(
      `Failed to upload new image for studentId ${studentId}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return imageWarningFromError(error);
  }
};

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
      sortOrder: z.string().regex(/^\d*$/).optional(),
      email: z.email(),
      linkedin: z.url(),
      github: z.url().or(z.literal("")).optional(),
      image: optionalImage,
    }),
    handler: async (input, context) => {
      let imageWarning: ImageWarningCode | undefined;
      const oldImageExists =
        input.oldStudentId !== input.studentId &&
        (await checkMemberImageExists({ studentId: input.oldStudentId }));

      if (input.image) {
        if (oldImageExists) {
          try {
            await fileHandler.remove(context, publicBucket(), [
              getMemberImageObjectName(input.oldStudentId),
            ]);
          } catch (error) {
            console.error(
              `Failed to delete old image for studentId ${input.oldStudentId}: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        }
        imageWarning = await uploadMemberImage(
          context,
          input.image,
          input.studentId,
        );
      } else if (oldImageExists) {
        try {
          const res = await fileHandler.rename(
            context,
            publicBucket(),
            getMemberImageObjectName(input.oldStudentId),
            getMemberImageObjectName(input.studentId),
          );
          if (!res) {
            console.error(
              `Failed to rename image for studentId ${input.oldStudentId} to ${input.studentId}: No response from fileHandler.rename`,
            );
            imageWarning = "unknown";
          }
        } catch (error) {
          console.error(
            `Failed to rename old image for studentId ${input.oldStudentId}: ${error instanceof Error ? error.message : String(error)}`,
          );
          imageWarning = imageWarningFromError(error);
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
            sortOrder: input.sortOrder ? Number(input.sortOrder) : null,
            email: input.email,
            linkedin: input.linkedin,
            github: input.github || null,
          })
          .where(eq(deltaForceTable.studentId, input.oldStudentId))
          .run();
      } catch (error) {
        console.error(
          `Failed to update member with studentId ${input.oldStudentId}: ${error instanceof Error ? error.message : String(error)}`,
        );
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update database. See server logs for details.`,
        });
      }
      return { studentId: input.studentId, imageWarning };
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
      sortOrder: z.string().regex(/^\d*$/).optional(),
      email: z.email(),
      linkedin: z.url(),
      github: z.url().or(z.literal("")).optional(),
      image: optionalImage,
    }),
    handler: async (input, context) => {
      const imageWarning = input.image
        ? await uploadMemberImage(context, input.image, input.studentId)
        : undefined;
      try {
        await db
          .insert(deltaForceTable)
          .values({
            firstName: input.firstName,
            lastName: input.lastName,
            studentId: input.studentId,
            role: input.role,
            sortOrder: input.sortOrder ? Number(input.sortOrder) : null,
            email: input.email,
            linkedin: input.linkedin,
            github: input.github || null,
          })
          .run();
      } catch (error) {
        console.error(
          `Failed to add new member with studentId ${input.studentId}: ${error instanceof Error ? error.message : String(error)}`,
        );
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to add new member to database. See server logs for details.",
        });
      }
      return { studentId: input.studentId, imageWarning };
    },
  }),
  deleteDeltaForceMember: defineAction({
    accept: "form",
    input: z.object({
      studentId: z.string().regex(studentIdRegex),
    }),
    handler: async (input, context) => {
      try {
        await db
          .delete(deltaForceTable)
          .where(eq(deltaForceTable.studentId, input.studentId))
          .run();
      } catch (error) {
        console.error(
          `Failed to delete member with studentId ${input.studentId}: ${error instanceof Error ? error.message : String(error)}`,
        );
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to delete member from database. See server logs for details.",
        });
      }

      try {
        await fileHandler.remove(context, publicBucket(), [
          getMemberImageObjectName(input.studentId),
        ]);
      } catch (error) {
        console.error(
          `Failed to delete image for studentId ${input.studentId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      return { studentId: input.studentId };
    },
  }),
};

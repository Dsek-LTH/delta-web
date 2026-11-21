import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { db } from "@/db/connect";
import { attendeesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  optionalImage,
  profileImageCompression,
  uploadFile,
} from "@/files/uploadFiles";
import { getAttendeeImageObjectName, publicBucket } from "@/files/client";
import fileHandler from "@/files/fileHandler";
import type { AuthContext } from "@/auth/authorize";
import {
  imageWarningFromError,
  type ImageWarningCode,
} from "@/files/imageWarnings";

const uploadAttendeeImage = async (
  context: AuthContext,
  image: File,
  id: number,
): Promise<ImageWarningCode | undefined> => {
  try {
    await uploadFile(
      context,
      image,
      "attendees",
      publicBucket(),
      `${id}`,
      profileImageCompression,
    );
  } catch (error) {
    console.error(
      `Failed to upload image for attendee ${id}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return imageWarningFromError(error);
  }
};

const normalizeTags = (tags: string) =>
  tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .join(", ");

const attendeeFields = {
  name: z.string().trim().min(1),
  descriptionSv: z.string().trim().min(1),
  descriptionEn: z.string().trim().min(1),
  industry: z.string().trim().min(1),
  tags: z.string().trim().min(1).transform(normalizeTags),
  contact: z.string().trim().min(1),
  linkedin: z.union([z.url(), z.literal(""), z.literal("#")]),
  image: optionalImage,
};

export const attendee = {
  updateAttendee: defineAction({
    accept: "form",
    input: z.object({
      id: z.coerce.number().int().positive(),
      ...attendeeFields,
    }),
    handler: async (input, context) => {
      let imageWarning: ImageWarningCode | undefined;
      try {
        const updated = await db
          .update(attendeesTable)
          .set({
            name: input.name,
            descriptionSv: input.descriptionSv,
            descriptionEn: input.descriptionEn,
            industry: input.industry,
            tags: input.tags,
            contact: input.contact,
            linkedin: input.linkedin,
          })
          .where(eq(attendeesTable.id, input.id))
          .returning({ id: attendeesTable.id })
          .get();
        if (!updated) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "Attendee not found.",
          });
        }
        if (input.image) {
          imageWarning = await uploadAttendeeImage(
            context,
            input.image,
            updated.id,
          );
        }
        return { id: updated.id, imageWarning };
      } catch (error) {
        if (error instanceof ActionError) throw error;
        console.error(
          `Failed to update attendee with id ${input.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update database. See server logs for details.`,
        });
      }
    },
  }),
  addAttendee: defineAction({
    accept: "form",
    input: z.object(attendeeFields),
    handler: async (input, context) => {
      let id: number;
      try {
        const inserted = await db
          .insert(attendeesTable)
          .values({
            name: input.name,
            descriptionSv: input.descriptionSv,
            descriptionEn: input.descriptionEn,
            industry: input.industry,
            tags: input.tags,
            contact: input.contact,
            linkedin: input.linkedin,
          })
          .returning({ id: attendeesTable.id })
          .get();
        id = inserted.id;
      } catch (error) {
        console.error(
          `Failed to add new attendee ${input.name}: ${error instanceof Error ? error.message : String(error)}`,
        );
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to add new attendee to database. See server logs for details.",
        });
      }
      const imageWarning = input.image
        ? await uploadAttendeeImage(context, input.image, id)
        : undefined;
      return { id, imageWarning };
    },
  }),
  deleteAttendee: defineAction({
    accept: "form",
    input: z.object({
      id: z.coerce.number().int().positive(),
    }),
    handler: async (input, context) => {
      try {
        await db
          .delete(attendeesTable)
          .where(eq(attendeesTable.id, input.id))
          .run();
      } catch (error) {
        console.error(
          `Failed to delete attendee with id ${input.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to delete attendee from database. See server logs for details.",
        });
      }

      try {
        await fileHandler.remove(context, publicBucket(), [
          getAttendeeImageObjectName(input.id),
        ]);
      } catch (error) {
        console.error(
          `Failed to delete image for attendee ${input.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      return { id: input.id };
    },
  }),
};

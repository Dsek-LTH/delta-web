import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { db } from "@/db/connect";
import { attendeesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { uploadFile } from "@/files/uploadFiles";
import { env } from "@/envvars";
import type { APIContext } from "astro";
import fileHandler from "@/files/fileHandler";
import { checkAttendeeImageExists } from "@/files/client";
import { prepareNameForFilesystem } from "@/files/utils";

const optionalImage = z.preprocess(
  (value) => (value instanceof File && value.size === 0 ? undefined : value),
  z
    .instanceof(File)
    .refine((f) => f.size > 0)
    .optional(),
);

const attendeeImageObjectName = (id: number) =>
  `attendees/${prepareNameForFilesystem(id.toString(), id.toString(), "webp")}`;

const uploadAttendeeImage = async (
  context: APIContext,
  image: File,
  id: number,
): Promise<string | undefined> => {
  try {
    await uploadFile(
      context,
      image,
      "attendees",
      env.MINIO_BUCKET_PUBLIC || "delta-public",
      `${id}`,
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
    return undefined;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to upload image for attendee ${id}: ${message}`);
    return message;
  }
};

export const attendee = {
  updateAttendee: defineAction({
    accept: "form",
    input: z.object({
      lang: z.string(),
      id: z.coerce.number().int(),
      name: z.string(),
      descriptionSv: z.string(),
      descriptionEn: z.string(),
      industry: z.string(),
      tags: z.string(),
      contact: z.string(),
      linkedin: z.url(),
      image: optionalImage,
    }),
    handler: async (input, context) => {
      console.log("Updating attendee:", input.id);
      let imageError: string | undefined;
      if (input.image) {
        imageError = await uploadAttendeeImage(
          context as APIContext,
          input.image,
          input.id,
        );
      }
      try {
        await db
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
          .run();
      } catch (error) {
        console.error(
          `Failed to update attendee with id ${input.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update database. See server logs for details.`,
        });
      }
      return { id: input.id, imageError };
    },
  }),
  addAttendee: defineAction({
    accept: "form",
    input: z.object({
      lang: z.string(),
      name: z.string(),
      descriptionSv: z.string(),
      descriptionEn: z.string(),
      industry: z.string(),
      tags: z.string(),
      contact: z.string(),
      linkedin: z.url(),
      image: optionalImage,
    }),
    handler: async (input, context) => {
      console.log("Adding new attendee:", input.name);
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
      let imageError: string | undefined;
      if (input.image) {
        imageError = await uploadAttendeeImage(
          context as APIContext,
          input.image,
          id,
        );
      }
      return { id, imageError };
    },
  }),
  deleteAttendee: defineAction({
    accept: "form",
    input: z.object({
      id: z.coerce.number().int(),
    }),
    handler: async (input, context) => {
      console.log("Deleting attendee with id:", input.id);
      if (await checkAttendeeImageExists({ id: input.id })) {
        try {
          await fileHandler.remove(
            context as APIContext,
            env.MINIO_BUCKET_PUBLIC || "delta-public",
            [attendeeImageObjectName(input.id)],
          );
        } catch (error) {
          console.error(
            `Failed to delete image for attendee ${input.id}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
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

      return { id: input.id };
    },
  }),
};

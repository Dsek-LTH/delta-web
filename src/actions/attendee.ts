import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { db } from "@/db/connect";
import { attendeesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

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
    }),
    handler: async (input) => {
      console.log("Updating attendee:", input.id);
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
      return { id: input.id };
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
    }),
    handler: async (input) => {
      console.log("Adding new attendee:", input.name);
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
        return { id: inserted.id };
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
    },
  }),
  deleteAttendee: defineAction({
    accept: "form",
    input: z.object({
      id: z.coerce.number().int(),
    }),
    handler: async (input) => {
      console.log("Deleting attendee with id:", input.id);
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

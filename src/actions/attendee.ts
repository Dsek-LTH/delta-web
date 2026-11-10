import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { db } from "@/db/connect";
import { attendeesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

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
};

export const attendee = {
  updateAttendee: defineAction({
    accept: "form",
    input: z.object({
      id: z.coerce.number().int().positive(),
      ...attendeeFields,
    }),
    handler: async (input) => {
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
        return { id: updated.id };
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
    handler: async (input) => {
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
      id: z.coerce.number().int().positive(),
    }),
    handler: async (input) => {
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

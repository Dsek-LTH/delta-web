import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { deltaForceRoles } from "@/constants";
import { db } from "@/db/connect";
import { deltaForceTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export const deltaForceMember = {
  updateDeltaForceMember: defineAction({
    accept: "form",
    input: z.object({
      lang: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      oldStudentId: z.string(),
      studentId: z.string(),
      role: z.enum(deltaForceRoles),
      email: z.email(),
      linkedin: z.url(),
    }),
    handler: async (input) => {
      console.log("Updating member:", input);
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
      console.log("Member updated successfully:", input);

      return { studentId: input.studentId };
    },
  }),
  addDeltaForceMember: defineAction({
    accept: "form",
    input: z.object({
      lang: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      studentId: z.string(),
      role: z.enum(deltaForceRoles),
      email: z.email(),
      linkedin: z.url(),
    }),
    handler: async (input) => {
      console.log("Adding new member:", input);
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
      console.log("Member added successfully:", input);
      return { studentId: input.studentId };
    },
  }),
  deleteDeltaForceMember: defineAction({
    accept: "form",
    input: z.object({
      studentId: z.string(),
    }),
    handler: async (input) => {
      console.log("Deleting member with studentId:", input.studentId);
      await db
        .delete(deltaForceTable)
        .where(eq(deltaForceTable.studentId, input.studentId))
        .run();
      console.log(
        "Member deleted successfully with studentId:",
        input.studentId,
      );
      return { studentId: input.studentId };
    },
  }),
};

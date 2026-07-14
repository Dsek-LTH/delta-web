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
};

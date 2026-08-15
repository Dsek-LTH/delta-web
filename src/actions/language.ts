import { defineAction } from "astro:actions";
import { z } from "astro/zod";

export const language = {
  setLanguage: defineAction({
    input: z.object({ lang: z.enum(["sv", "en"]) }),
    handler: async ({ lang }, context) => {
      context.cookies.set("lang", lang, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
      return { success: true };
    },
  }),
};

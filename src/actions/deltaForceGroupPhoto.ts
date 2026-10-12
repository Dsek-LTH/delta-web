import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { deltaForcePhotoGroups } from "@/constants";
import { uploadFile } from "@/files/uploadFiles";
import { publicBucket } from "@/files/client";

const requiredImage = z
  .instanceof(File)
  .refine((file) => file.size > 0, "An image file is required.");

export const deltaForceGroupPhoto = {
  uploadGroupPhoto: defineAction({
    accept: "form",
    input: z.object({
      group: z.enum(deltaForcePhotoGroups),
      image: requiredImage,
    }),
    handler: async (input, context) => {
      try {
        await uploadFile(
          context,
          input.image,
          "delta-force-groups",
          publicBucket(),
          input.group,
          {
            resize: {
              width: 2400,
              fit: "inside",
            },
            webp: {
              quality: 80,
            },
          },
        );
      } catch (error) {
        console.error(
          `Failed to upload group photo for ${input.group}: ${error instanceof Error ? error.message : String(error)}`,
        );
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "The photo could not be uploaded.",
        });
      }
      return { group: input.group };
    },
  }),
};

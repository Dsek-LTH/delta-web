import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { deltaForcePhotoGroups } from "@/constants";
import { uploadFile } from "@/files/uploadFiles";
import { env } from "@/envvars";
import type { APIContext } from "astro";

const requiredImage = z
  .instanceof(File)
  .refine((file) => file.size > 0, "An image file is required.");

export const deltaForceGroupPhoto = {
  uploadGroupPhoto: defineAction({
    accept: "form",
    input: z.object({
      lang: z.string(),
      group: z.enum(deltaForcePhotoGroups),
      image: requiredImage,
    }),
    handler: async (input, context) => {
      console.log("Uploading group photo for:", input.group);
      try {
        await uploadFile(
          context as APIContext,
          input.image,
          "delta-force-groups",
          env.MINIO_BUCKET_PUBLIC || "delta-public",
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
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          `Failed to upload group photo for ${input.group}: ${message}`,
        );
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        });
      }
      return { group: input.group };
    },
  }),
};

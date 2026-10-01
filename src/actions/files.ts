import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { type CompressionOptions, uploadFile } from "@/files/uploadFiles";




export const files = {
  upload: defineAction({
    accept: "form",
    input: z.object({  
      file: z.instanceof(File),
      prefix: z.string(),
      bucket: z.string(),
      name: z.string().optional(),
      compressionOptions: z.custom<CompressionOptions>().optional()
     }),
    handler: async ({ file, prefix, bucket, name, compressionOptions }, context) => {
      return await uploadFile(
        context.request.headers,
        file,
        prefix,
        bucket,
        name,
        compressionOptions,
      );
    },
  }),
};

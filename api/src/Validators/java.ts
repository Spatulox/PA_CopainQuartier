import { z } from "zod";

export const zJavaUpload = z.object({
  version: z.string(),
});

export type JavaUpload = z.infer<typeof zJavaUpload>;
import { z } from "zod";

export const zLangaje = z.object({
  query: z.string().min(1, "Query is required"),
});

export type LangajeRequest = z.infer<typeof zLangaje>;
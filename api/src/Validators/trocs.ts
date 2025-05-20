import { z } from "zod";

// Enum Zod (si tes enums sont des string unions TypeScript, tu peux les redéclarer ici)
const TrocTypeSchema = z.enum(["service", "item", "serviceMorethanOnePerson"]);
const TrocStatusSchema = z.enum(["pending", "completed", "cancelled", "hide", "reserved", "waitingforapproval"]);
const TrocVisibilitySchema = z.enum(["hide", "visible"]);

export const zCreateTrocSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: TrocTypeSchema,
});

export const zUpdateTrocSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  type: TrocTypeSchema.optional(),
  visibility: TrocVisibilitySchema.optional(),
  status: TrocStatusSchema.optional(),
  reserved_at: z.coerce.date().optional(),
});

export type CreateTrocBody = z.infer<typeof zCreateTrocSchema>
export type UpdateTrocBody = z.infer<typeof zUpdateTrocSchema>
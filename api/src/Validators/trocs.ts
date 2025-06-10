import { z } from "zod";
import { TrocStatus, TrocType, TrocVisibility } from "../Models/TrocModel";


function zodEnum<T extends { [key: string]: string }>(enumObj: T) {
  return z.enum([...Object.values(enumObj)] as [string, ...string[]]);
}

export const TrocTypeSchema = zodEnum(TrocType)
export const TrocStatusSchema = zodEnum(TrocStatus)
export const TrocVisibilitySchema = zodEnum(TrocVisibility)

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
  reserved_at: z.coerce.date().optional(),
});

export const zTrocQuery = z.object({
  applied: 
  z.string()
  .optional()
  .transform(val => (val === "true" ? true : false)),
});

export const zTrocAction = z.enum(["reserve", "complete", "cancel", "leave"]);

export type CreateTrocBody = z.infer<typeof zCreateTrocSchema>
export type UpdateTrocBody = z.infer<typeof zUpdateTrocSchema>
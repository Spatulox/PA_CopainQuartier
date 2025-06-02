import { z } from "zod";

export const zCreateActivity = z.object({
    title: z.string().min(3),
    description: z.string(),
    date_reservation: z.string().datetime(),
    location: z.string(),
    max_place: z.coerce.number(),
});

export const zUpdateActivity = z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    date_reservation: z.coerce.date().optional(),
});

export const zActivityQuery = z.object({
  channel_chat_id: z
    .string()
    .nullable()
    .optional()
    .transform(val => (val === "null" ? null : val)),
  title: z.string().optional()
});

export type CreateActivityParam = z.infer<typeof zCreateActivity>

export type UpdateActivityParam = z.infer<typeof zUpdateActivity>

export type ActivityQueryParam = z.infer<typeof zActivityQuery>
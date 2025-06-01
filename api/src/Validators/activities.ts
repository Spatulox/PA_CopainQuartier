import { z } from "zod";

export const zCreateActivity = z.object({
    title: z.string().min(3),
    description: z.string(),
    date_reservation: z.string().datetime(),
    location: z.string(),
});

export const zUpdateActivity = z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    date_reservation: z.coerce.date().optional(),
});

export type CreateActivityParam = z.infer<typeof zCreateActivity>

export type UpdateActivityParam = z.infer<typeof zUpdateActivity>
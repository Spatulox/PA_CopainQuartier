import { z } from "zod";

export const zCreateActivity = z.object({
    title: z.string().min(3),
    description: z.string(),
    date_reservation: z.date(),
});

export type CreateActivityParam = z.infer<typeof zCreateActivity>
import { z } from "zod"

export const zCreatePublication = z.object({
    name: z.string().min(3),
    activity_id: z.string().optional(),
    body: z.string().min(0)
});

export const zUpdatePublication = z.object({
    name: z.string().min(1),
    activity_id: z.string().optional(),
    body: z.string().min(1).optional()
});

export type CreatePublicationParam = z.infer<typeof zCreatePublication>
export type UpdatePublicationParam = z.infer<typeof zUpdatePublication>
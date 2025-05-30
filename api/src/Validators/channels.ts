import { z } from "zod"
import { zObjectId } from "./utils";

export const zUpdateChannel = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(['text', 'vocal']).optional(),
    member_auth: z.enum(['read_send', 'read_only']).optional(),
});

export const zTransferChannel = z.object({
    new_admin_id: z.number().int().positive(),
})

export const zCreateChannel = z.object({
    name: z.string(),
    type: z.enum(["text", "vocal"]),
    description: z.string(),
    activity_id_linked: zObjectId.optional()
})

export const zPostMessage = z.object({
    message: z.string(),
    user_id: z.string()
})


export type TransferChannelParam = z.infer<typeof zTransferChannel>
export type UpdateChannelParam = z.infer<typeof zUpdateChannel>
export type CreateChannelParam = z.infer<typeof zCreateChannel>
export type PostMessageParam = z.infer<typeof zPostMessage>
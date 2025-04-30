import { z } from "zod"

export const zUpdateChannel = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(['text', 'vocal']).optional(),
    member_auth: z.enum(['read_send', 'read_only']).optional(),
});

export const zTransferChannel = z.object({
    new_admin_id: z.number().int().positive(),
})



export type TransferChannelParam = z.infer<typeof zTransferChannel>
export type UpdateChannelParam = z.infer<typeof zUpdateChannel>
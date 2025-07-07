import { z } from "zod";

export const zGenerateInvite = z.object({
    channel_id: z.string()
})
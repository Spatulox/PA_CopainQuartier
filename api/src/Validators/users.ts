import { z } from "zod";

export const zUpdateAccount = z.object({
    lastname: z.string().optional(),
    name: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional()
})

export type UpdateAccountType = z.infer<typeof zUpdateAccount>
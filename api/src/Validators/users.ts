import { z } from "zod";

export const zUpdateAccount = z.object({
    lastname: z.string().optional(),
    name: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
})

export const zUpdateAccountAdmin = z.object({
    lastname: z.string().optional(),
    name: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    role: z.enum(["admin", "member"]).optional()
})

export type UpdateAccountType = z.infer<typeof zUpdateAccount>
export type UpdateAdminAccountType = z.infer<typeof zUpdateAccountAdmin>
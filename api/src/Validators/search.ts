import { z } from "zod";


export const zSearchData = z.object({
    data: z.string()
})

export type SearchParam = z.infer<typeof zSearchData>
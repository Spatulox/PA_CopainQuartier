import {z} from "zod";

export const zId = z.coerce.number().int().positive();
export const zObjectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");



export const zApprove = z.object({
  approve: z.boolean()
});
export type ApproveBody = z.infer<typeof zApprove>

import { isValidObjectId } from "mongoose";
import {z} from "zod";

export const zId = z.coerce.number().int().positive();
export const zObjectId = z.string().refine(isValidObjectId, "Invalid Object ID")

export const zApprove = z.object({
  approve: z.boolean()
});
export type ApproveBody = z.infer<typeof zApprove>

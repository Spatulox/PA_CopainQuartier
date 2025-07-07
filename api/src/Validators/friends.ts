import { z } from "zod";
export const zFriendsAction = z.enum(["validate", "reject", "request"]);
import mongoose, { model, Schema } from "mongoose";
import { Invite } from "../Models/InviteModel";

const InviteSchema = new Schema<Invite>({
    channel_id: { type: Schema.Types.ObjectId , ref: "Channel", default: null },
})

export const InviteTable = model('Invite', InviteSchema);
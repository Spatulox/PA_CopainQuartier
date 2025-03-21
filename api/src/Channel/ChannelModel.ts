
import mongoose from "mongoose";

export interface Channel {
    _id: mongoose.Types.ObjectId,
    name: string,
    type: string,
    description: string,
    admin_id: mongoose.Types.ObjectId,
    message?: [
        date: Date,
        content: string,
        author_id: mongoose.Types.ObjectId
    ],
    members: mongoose.Types.ObjectId[],
    member_auth: string,
    created_at: Date,
}
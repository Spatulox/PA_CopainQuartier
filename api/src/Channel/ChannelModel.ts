
import mongoose from "mongoose";

export interface Channel {
    _id: mongoose.Types.ObjectId,
    name: string,
    publication_id : mongoose.Types.ObjectId,
    type: string,
    description: string,
    admin_id: mongoose.Types.ObjectId,
    messages?: [Message],
    members: mongoose.Types.ObjectId[],
    member_auth: string,
    created_at: Date,
}

export interface Message {
    date: Date,
    content: string,
    author_id: mongoose.Types.ObjectId
}
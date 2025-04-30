import mongoose from "mongoose";

export interface Activity {
    _id: mongoose.Types.ObjectId,
    title: string,
    description: string,
    created_at: Date,
    date_reservation: Date,
    author_id: mongoose.Types.ObjectId,
    channel_chat_id: mongoose.Types.ObjectId,
    publication_id: mongoose.Types.ObjectId,
    participants_id: mongoose.Types.ObjectId
}


export type PublicActivity = Omit<Activity, "channel_chat_id" | "participants_id">;

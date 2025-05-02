import mongoose from "mongoose";

export interface Activity {
    _id: string,
    title: string,
    description: string,
    created_at: Date,
    date_reservation: Date,
    author_id: string,
    channel_chat_id: string,
    publication_id: string,
    participants_id: string
}


export type PublicActivity = Omit<Activity, "channel_chat_id" | "participants_id">;

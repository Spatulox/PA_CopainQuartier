import mongoose, { ObjectId } from "mongoose";
import { FilledPublication, Publication } from "./PublicationModel";
import { User } from "./UserModel";

export interface Activity {
    _id: ObjectId,
    title: string,
    description: string,
    created_at: Date,
    date_reservation: Date,
    author_id: ObjectId,
    channel_chat_id: ObjectId,
    publication_id: ObjectId,
    participants_id: ObjectId[]
}

export type FilledActivity = Omit<Activity, "author_id" | "publication_id" | "participants_id"> & {author: User | null, publication: Publication | FilledPublication | null, participants: User[] | null}


export type PublicActivity = Omit<Activity, "channel_chat_id" | "participants_id">;

export type PublicFilledActivity = Omit<FilledActivity, "channel_chat_id" | "participants"> & {author: User | null, publication: Publication | FilledPublication | null};

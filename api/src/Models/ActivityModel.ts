import mongoose, { ObjectId } from "mongoose";
import { FilledPublication, Publication } from "./PublicationModel";
import { FilledUser, User } from "./UserModel";
import { Channel, FilledChannel } from "./ChannelModel";

export type Activity = {
    _id: ObjectId,
    title: string,
    description: string,
    created_at: Date,
    date_reservation: Date,
    date_end: Date,
    author_id: ObjectId,
    channel_chat_id: ObjectId,
    publication_id: ObjectId,
    participants_id: ObjectId[],
    location: string,
    max_place: {type: Number, required: true},
    reserved_place: {type: Number, required: true},
}

export type FilledActivity = Omit<Activity, "author_id" | "publication_id" | "participants_id" | "_id" | "channel_chat_id"> &{
    _id: string,
    author: FilledUser | null,
    publication: Publication | FilledPublication | null,
    participants: User[] | FilledUser[] | null,
    channel_chat: FilledChannel | null
}


export type PublicActivity = Omit<Activity, "channel_chat_id" | "participants_id" | "location" | "max_place" | "reserved_place">;

export type PublicFilledActivity = Omit<FilledActivity, "channel_chat" | "participants"> & {author: FilledUser | null, publication: Publication | FilledPublication | null};

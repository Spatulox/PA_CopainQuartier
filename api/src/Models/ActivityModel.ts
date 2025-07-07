import mongoose, { ObjectId } from "mongoose";
import { FilledPublication, Publication } from "./PublicationModel";
import { FilledUser, User } from "./UserModel";
import { Channel, FilledChannel } from "./ChannelModel";
import { ObjectID } from "../DB_Schema/connexion";

export type Activity = {
    _id: ObjectID,
    title: string,
    description: string,
    created_at: Date,
    date_reservation: Date,
    date_end: Date,
    author_id: ObjectID,
    channel_chat_id: ObjectID,
    publication_id: ObjectID,
    participants_id: ObjectID[],
    location: string,
    max_place: number,
    image_link?: string | null,
    reserved_place: number,
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

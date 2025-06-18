import { Channel, FilledChannel } from "./ChannelModel";
import { ObjectID } from "../DB_Schema/connexion";
import { Activity, FilledActivity } from "./ActivityModel";

export type User ={
    _id: ObjectID,
    name: string,
    lastname: string,
    email: string,
    password: string,
    address: string,
    verified: boolean,
    role: string,
    group_chat_list_ids: ObjectID[],
    troc_score?: string | null,
    phone: string,
    friends_id: Record<string, string>,
    friends_request_id: ObjectID[],
}

export type FilledUser = Omit<User, "_id" | "group_chat_list_ids" | "friends_id" | "password" | "friends_request_id"> & {_id: string, group_chat_list_ids: FilledChannel[], friends: Record<string, string>, friends_request: string[], common_channels?: Channel[] | FilledChannel[], common_activity?: Activity[] | FilledActivity[] };

export type PublicUser = Omit<FilledUser, "password" | "email" | "address" | "phone" | "group_chat_list_ids" | "friends" | "friends_request">


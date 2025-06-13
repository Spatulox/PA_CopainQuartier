import { FilledChannel } from "./ChannelModel";
import { ObjectID } from "../DB_Schema/connexion";

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
    friends_id: ObjectID[],
    friends_request_id: ObjectID[],
}

export type FilledUser = Omit<User, "_id" | "group_chat_list_ids" | "friends_id" | "password" | "friends_request_id"> & {_id: string, group_chat_list_ids: FilledChannel[], friends: ObjectID[], friends_request: ObjectID[] };

export type PublicUser = Omit<User, "password" | "email" | "address" | "phone" | "friends_id" | "friends_request_id"> & {
    common_channels: string[];
};


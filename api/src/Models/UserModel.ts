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
}

export type FilledUser = Omit<User, "_id" | "group_chat_list_ids"> & {_id: string, group_chat_list_ids: FilledChannel[]};

export type PublicUser = Omit<User, "password" | "email" | "address" | "phone"> & {
    common_channels: ObjectID[];
};


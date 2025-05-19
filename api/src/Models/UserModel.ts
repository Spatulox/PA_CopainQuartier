import { ObjectId } from "mongodb";
import { FilledChannel } from "./ChannelModel";

export type User ={
    _id: ObjectId,
    name: string,
    lastname: string,
    email: string,
    password: string,
    address: string,
    verified: boolean,
    role: string,
    group_chat_list_ids: ObjectId[],
    troc_score?: string | null,
    phone: string,
}

export type FilledUser = Omit<User, "_id" | "group_chat_list_ids"> & {_id: string, group_chat_list_ids: FilledChannel[]};

export type PublicUser = Omit<User, "password" | "email" | "address" | "phone"> & {
    common_channels: ObjectId[];
};


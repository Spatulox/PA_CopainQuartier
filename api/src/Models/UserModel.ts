import { ObjectId } from "mongodb";

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

export type PublicUser = Omit<User, "password" | "email" | "address" | "phone"> & {
    common_channels: ObjectId[];
};


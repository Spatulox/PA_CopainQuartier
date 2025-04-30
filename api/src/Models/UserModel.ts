import mongoose from "mongoose";

export interface User{
    _id: mongoose.Types.ObjectId,
    name: string,
    lastname: string,
    email: string,
    password: string,
    address: string,
    verified: boolean,
    role: string,
    group_chat_list_ids: mongoose.Types.ObjectId[],
    troc_score?: string | null,
    phone: string,
}

export type PublicUser = Omit<User, "password" | "email" | "address" | "phone"> & {
    common_channels: mongoose.Types.ObjectId[];
};


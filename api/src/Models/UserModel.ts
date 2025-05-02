import mongoose from "mongoose";

export interface User{
    _id: string,
    name: string,
    lastname: string,
    email: string,
    password: string,
    address: string,
    verified: boolean,
    role: string,
    group_chat_list_ids: string[],
    troc_score?: string | null,
    phone: string,
}

export type PublicUser = Omit<User, "password" | "email" | "address" | "phone"> & {
    common_channels: mongoose.Types.ObjectId[];
};



import mongoose from "mongoose";
import { User } from "./UserModel";

export interface Channel {
    _id: mongoose.Types.ObjectId,
    name: string,
    publication_id : mongoose.Types.ObjectId | null,
    type: string,
    description: string,
    admin_id: mongoose.Types.ObjectId,
    messages?: [Message],
    members: mongoose.Types.ObjectId[],
    member_auth: string,
    created_at: Date,
}

export type PublicChannel = Omit<Channel, "admin_id" | "messages" | "members" | "member_auth"> & {
    common_channels: mongoose.Types.ObjectId[];
};

export interface Message {
    date: Date,
    content: string,
    author_id?: mongoose.Types.ObjectId | "null",
    type: MessageType
}

export enum MessageType {
    system = "system",
    user = "user"
}

export function ChannelToPublicChannel(channel: Channel): PublicChannel {
    const { admin_id, messages, members, member_auth, ...publicFields } = channel;
    return publicFields as PublicChannel;
}

export function createMessage(content: string, user: User | null = null): Message {
    const data: Message = {
        date: new Date(),
        content: content,
        type: MessageType.system,
    };
    if (user != null) {
        data.author_id = user._id;
        data.type = MessageType.user
    }
    return data;
}

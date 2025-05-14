
import mongoose from "mongoose";
import { User } from "./UserModel";
import { ID } from "../Utils/IDType";
import { toActivityObject } from "../Services/activities/activities";
import { toUserObject } from "../Services/users/usersPublic";

export interface Channel {
    _id: string,
    name: string,
    activity_id : string | null,
    type: string,
    description: string,
    admin_id: string,
    messages?: Message[],
    members: string[],
    member_auth: string,
    created_at: Date,
}

//export type PublicChannel = Omit<Channel, "admin_id" | "messages" | "members" | "member_auth">
export interface PublicChannel {
    _id: string;
    name: string;
    activity_id: string | null;
    type: string;
    description: string;
    created_at: Date;
}


export interface Message {
    date: Date,
    content: string,
    author_id?: string | "null" | mongoose.Types.ObjectId,
    type: MessageType
}

export enum MessageType {
    system = "system",
    user = "user"
}

export function ChannelToPublicChannel(channel: Channel): PublicChannel {
    return {
        _id: channel._id.toString(),
        name: channel.name,
        activity_id: channel.activity_id ? channel.activity_id.toString() : null,
        type: channel.type,
        description: channel.description,
        created_at: channel.created_at,
    };
}

export function ObjectToChannel(channel: any): any {
    return {
        _id: channel._id.toString(),
        name: channel.name,
        activity: channel.activity_id ? toActivityObject(channel.activity_id) : null,
        type: channel.type,
        messages: Array.isArray(channel.messages)
        ? channel.messages.map((msg: any): Message => ({
            date: msg.date,
            content: msg.content,
            author_id: msg.author_id
                ? typeof msg.author_id === "object" && "toString" in msg.author_id
                    ? msg.author_id.toString()
                    : msg.author_id
                : "null",
            type: msg.type
        }))
        : [],
        description: channel.description,
        created_at: channel.created_at,
        admin_id: channel.admin_id ? toUserObject(channel.admin_id) : null,
        members: Array.isArray(channel.members)
            ? channel.members.map((m: any) => typeof m === 'object' ? { _id: m._id.toString(), name: m.name } : m.toString())
            : [],
        member_auth: channel.member_auth
    };
}

export function createMessage(content: string, user: User | ID | null = null): Message {
    const data: Message = {
        date: new Date(),
        content: content,
        type: MessageType.system,
    };
    if (user != null) {

        let author_id: mongoose.Types.ObjectId | null = null;
        if (typeof user === 'object' && '_id' in user) {
            author_id = new mongoose.Types.ObjectId(user._id);
        } else {
            author_id = new mongoose.Types.ObjectId(user as string);
        }
        data.author_id = author_id;
        data.type = MessageType.user
    }
    return data;
}

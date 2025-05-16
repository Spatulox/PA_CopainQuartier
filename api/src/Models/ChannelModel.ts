
import  { ObjectId } from "mongodb";
import { FilledUser, User } from "./UserModel";
import { toActivityObject } from "../Services/activities/activities";
import { toUserObject } from "../Services/users/usersPublic";
import { Activity, FilledActivity } from "./ActivityModel";

export type Channel = {
    _id: ObjectId,
    name: string,
    activity_id : ObjectId | null,
    type: string,
    description: string,
    admin_id: ObjectId,
    messages?: Message[],
    members: string[],
    member_auth: string,
    created_at: Date,
}

//export type PublicChannel = Omit<Channel, "admin_id" | "messages" | "members" | "member_auth">
export type PublicChannel = {
    _id: ObjectId;
    name: string;
    activity_id: ObjectId | null;
    type: string;
    description: string;
    created_at: Date;
}

export type FilledChannel = Omit<Channel, "activity_id" | "admin_id"> & {activity: FilledActivity | Activity | null, admin: User | null}
export type PublicFilledChannel = Omit<PublicChannel, "activity_id"> & {activity: FilledActivity | Activity | null}


export type Message = {
    date: Date,
    content: string,
    author_id?: ObjectId | null,
    type: MessageType
}

export type FilledMessage = Omit<Message, "author_id"> & {author: User | FilledUser | null}

export enum MessageType {
    system = "system",
    user = "user"
}

/*export function ObjectToChannel(channel: any): any {
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
}*/

export function createMessage(content: string, user: FilledUser | null = null): Message {
    const data: Message = {
        date: new Date(),
        content: content,
        type: MessageType.system,
    };
    if (user != null) {
        data.author_id = new ObjectId(user._id);
        data.type = MessageType.user
    }
    return data;
}

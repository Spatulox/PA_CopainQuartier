import mongoose from "mongoose";
import { Channel, ChannelToPublicChannel, createMessage, Message, MessageType, ObjectToChannel, PublicChannel } from "../../Models/ChannelModel";
import { ChannelAuth, ChannelTable } from "../../DB_Schema/ChannelSchema";
import { CreateChannelParam, PostMessageParam, TransferChannelParam, UpdateChannelParam } from "../../Validators/channels";
import { ID } from "../../Utils/IDType";
import { User } from "../../Models/UserModel";
import { UserTable } from "../../DB_Schema/UserSchema";

export async function getChannelById(channel_id: ID): Promise<Channel | null>{
    const res = await ChannelTable.findById(channel_id)
    return ObjectToChannel(res)
}

export async function getPublicChannelById(channel_id: ID): Promise<PublicChannel | null>{
    const channels = await ChannelTable.findById(channel_id).lean()
    if(!channels){
        return null
    }
    return ChannelToPublicChannel(channels)
}

export async function getMyChannel(user: User): Promise<Channel[] | null>{
    const res = await ChannelTable.find({
        admin_id: user._id
    }).lean().exec()
    return res.map(objectToChannel);
}

export async function createChannel(user: User, data: CreateChannelParam): Promise<Channel | null>{
    const mes: Message = createMessage("This is the start of the conversation", null)

    const dataToSave: any = {
        name: data.name,
        publication_id: null,
        type: data.type,
        description: data.description,
        admin_id: user._id,
        messages: [mes],
        members: [user._id],
        member_auth: ChannelAuth.read_send,
        created_at: new Date()

    }

    const channeltmp = await ChannelTable.create(dataToSave)
    if (channeltmp && channeltmp._id) {
        await UserTable.updateOne(
            { _id: user._id },
            { $addToSet: { group_chat_list_ids: channeltmp._id } }
        );
    }

    return objectToChannel(channeltmp);
}

export async function updateChannelAttribute(channel_id: ID, update: UpdateChannelParam): Promise<boolean> {
    const result = await ChannelTable.updateOne(
        { _id: channel_id },
        { $set: update }
    ).exec();
    return result.modifiedCount > 0;
}


export async function updateChannelAdmin(param: TransferChannelParam, channel_id: ID): Promise<boolean> {
    const result = await ChannelTable.updateOne(
      { _id: channel_id },
      { $set: { admin_id: param.new_admin_id } }
    ).exec();
    return result.modifiedCount > 0;
}

export async function addSomeoneFromChannel(channel_id: ID, user_id: ID): Promise<boolean> {
    const result = await ChannelTable.updateOne(
        { _id: channel_id },
        { $addToSet: { members: user_id } }
    ).exec();
    return result.modifiedCount > 0;
}


export async function removeSomeoneFromChannel(channel_id: ID, user_id: ID): Promise<boolean> {
    const result = await ChannelTable.updateOne(
        { _id: channel_id },
        { $pull: { members: user_id } }
    ).exec();
    return result.modifiedCount > 0;
}

export async function saveMessageToChannel(user: User | ID, channel_id: ID, content: PostMessageParam): Promise<boolean>{
    const message = createMessage(content.message, user)
    const result = await ChannelTable.updateOne(
        { _id: channel_id },
        { $push: { messages: message } }
    ).exec();
    return result.modifiedCount > 0
}

export async function deleteMessageFromChannel(channel_id: ID, message_id: ID): Promise<boolean> {
    const result = await ChannelTable.updateOne(
        { _id: channel_id },
        { $pull: { messages: { _id: message_id } } }
    ).exec();
    return result.modifiedCount > 0;
}


export async function deleteChannel(channel_id: ID): Promise<boolean>{
    const res = await ChannelTable.deleteOne({_id: channel_id})

    await UserTable.updateMany(
        { group_channel_list: channel_id },
        { $pull: { group_channel_list: channel_id } }
    );

    return res.deletedCount > 0
}







/**
 * Convertit un objet brut (plain object ou document Mongoose) en Channel typé.
 * @param obj L'objet provenant de la DB (plain object ou document Mongoose)
 * @returns Un objet Channel typé
 */
export function objectToChannel(obj: any): Channel {
    return {
        _id: obj._id?.toString(),
        name: obj.name,
        activity_id: obj.activity_id ? obj.activity_id.toString() : null,
        type: obj.type,
        description: obj.description,
        admin_id: obj.admin_id?.toString(),
        messages: obj.messages?.map(objectToMessage) ?? [],
        members: Array.isArray(obj.members)
            ? obj.members.map((m: any) => m?.toString())
            : [],
        member_auth: obj.member_auth,
        created_at: obj.created_at ? new Date(obj.created_at) : new Date(),
    };
}

/**
 * Convertit un objet brut en Message typé.
 * @param obj L'objet message provenant de la DB
 * @returns Un objet Message typé
 */
function objectToMessage(obj: any): Message {
    return {
        date: obj.date ? new Date(obj.date) : new Date(),
        content: obj.content,
        author_id: obj.author_id ? obj.author_id.toString() : undefined,
        type: obj.type,
    };
}

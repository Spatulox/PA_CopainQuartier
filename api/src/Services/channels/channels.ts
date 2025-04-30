import mongoose from "mongoose";
import { Channel, ChannelToPublicChannel, createMessage, Message, MessageType, PublicChannel } from "../../Models/ChannelModel";
import { ChannelAuth, ChannelTable } from "../../DB_Schema/ChannelSchema";
import { CreateChannelParam, TransferChannelParam, UpdateChannelParam } from "../../Validators/channels";
import { ID } from "../../Utils/IDType";
import { User } from "../../Models/UserModel";

export async function getChannelById(channel_id: ID): Promise<Channel | null>{
    return await ChannelTable.findById(channel_id)
}

export async function getPublicChannelById(channel_id: ID): Promise<PublicChannel | null>{
    const channels = await ChannelTable.findById(channel_id)
    if(!channels){
        return null
    }
    return ChannelToPublicChannel(channels)
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
    return await ChannelTable.create(dataToSave)
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


export async function deleteChannel(channel_id: ID): Promise<boolean>{
    const res = await ChannelTable.deleteOne({_id: channel_id})
    return res.deletedCount > 0
}
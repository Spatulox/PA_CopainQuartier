import mongoose from "mongoose";
import { Channel, ChannelToPublicChannel, PublicChannel } from "../../Models/ChannelModel";
import { ChannelTable } from "../../DB_Schema/ChannelSchema";
import { TransferChannelParam, UpdateChannelParam } from "../../Validators/channels";
import { ID } from "../../Utils/IDType";

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


export async function updateChannelAttribute(channel_id: ID, update: UpdateChannelParam): Promise<boolean> {
    const result = await ChannelTable.updateOne(
        { _id: channel_id },
        { $set: update }
    ).exec();
    return result.modifiedCount > 0;
}


export async function updateChannelAdmin(param: TransferChannelParam, channel_id: ID) {
    return await ChannelTable.updateOne(
      { _id: channel_id },
      { $set: { admin_id: param.new_admin_id } }
    ).exec();
}
  
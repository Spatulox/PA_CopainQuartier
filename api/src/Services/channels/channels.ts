import mongoose from "mongoose";
import { Channel, createMessage, FilledChannel, FilledMessage, Message, MessageType, PublicChannel, PublicFilledChannel } from "../../Models/ChannelModel";
import { ChannelAuth, ChannelTable } from "../../DB_Schema/ChannelSchema";
import { CreateChannelParam, PostMessageParam, TransferChannelParam, UpdateChannelParam } from "../../Validators/channels";
import { FilledUser, User } from "../../Models/UserModel";
import { UserRole, UserTable } from "../../DB_Schema/UserSchema";
import { getUserById, toUserObject } from "../users/usersPublic";
import { getActivityById, toActivityObject } from "../activities/activities";
import { ObjectID } from "../../DB_Schema/connexion";
import { ActivityTable } from "../../DB_Schema/ActivitiesSchema";
import { ac } from "@faker-js/faker/dist/airline-CBNP41sR";
import { id_ID } from "@faker-js/faker/.";

export async function getChannelById(channel_id: ObjectID): Promise<FilledChannel | null>{
    const res = await ChannelTable.findById(channel_id)
    .populate("admin_id")
    .populate("activity_id")
    .exec()
    
    return objectToChannel(res)
}

export async function getPublicChannelById(channel_id: ObjectID): Promise<PublicFilledChannel | null>{
    const channels = await ChannelTable.findById(channel_id).lean()
    if(!channels){
        return null
    }
    return ChannelToPublicChannel(channels)
}

export async function getMyChannel(user: User): Promise<FilledChannel[] | null>{
    const res = await ChannelTable.find({
        $or: [
            { admin_id: user._id },
            { members: user._id }
        ]
    }).lean().exec();

    return res.map(objectToChannel);
}

export async function getAllChannelImInside(user: User): Promise<FilledChannel[] | null>{
    const res = await ChannelTable.find({
        members: user._id
    }).lean().exec()
    return res.map(objectToChannel);
}

export async function getAllChannel(user: User): Promise<FilledChannel[] | null>{
    if (user.role != UserRole.admin){return null}

    const res = await ChannelTable.find({
    }).lean()
    .populate("admin_id")
    .populate("members")
    .exec()
    return res.map(objectToChannel);
}

export async function createChannel(user: User, data: CreateChannelParam): Promise<FilledChannel | null>{
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
        created_at: new Date(),
        activity_id: data.activity_id_linked ? data.activity_id_linked : undefined

    }

    const channeltmp = await ChannelTable.create(dataToSave)
    if (channeltmp && channeltmp._id) {
        await UserTable.updateOne(
            { _id: user._id },
            { $addToSet: { group_chat_list_ids: channeltmp._id } }
        );
    }

    if("activity_id_linked" in data){
        const activityTmp = await ActivityTable.updateOne(
            {_id: data.activity_id_linked},
            {channel_chat_id: channeltmp.id}
        )
        
        let acti = null;
        if (data.activity_id_linked) {
            acti = await getActivityById(data.activity_id_linked);
        }


        if (acti?.participants && acti.participants.length > 0) {
            // Récupérer les IDs des participants de l'activité
            const user_ids = acti?.participants
                ? acti.participants.map((part) => new ObjectID(part._id)).filter(Boolean)
                : [];

            // Ajouter les participants comme membres du nouveau channel
            channeltmp.members.push(...user_ids);

            await channeltmp.save();

            // Pour chaque utilisateur, ajouter le channel à leur liste de groupes
            await UserTable.updateMany(
                { _id: { $in: user_ids } },
                { $addToSet: { group_chat_list_ids: channeltmp._id } }
            );
        }
    }

    return objectToChannel(channeltmp);
}

export async function updateChannelAttribute(channel_id: ObjectID, update: UpdateChannelParam): Promise<boolean> {
    const result = await ChannelTable.updateOne(
        { _id: channel_id },
        { $set: update }
    ).exec();
    return result.modifiedCount > 0;
}


export async function updateChannelAdmin(param: TransferChannelParam, channel_id: ObjectID): Promise<boolean> {
    const result = await ChannelTable.updateOne(
      { _id: channel_id },
      { $set: { admin_id: param.new_admin_id } }
    ).exec();
    return result.modifiedCount > 0;
}

export async function addSomeoneFromChannel(channel_id: ObjectID, user_id: ObjectID): Promise<boolean> {
    const result = await ChannelTable.updateOne(
        { _id: channel_id },
        { $addToSet: { members: user_id } }
    ).exec();
    return result.modifiedCount > 0;
}


export async function removeSomeoneFromChannel(channel_id: ObjectID, user_id: ObjectID): Promise<boolean> {
    const result = await ChannelTable.updateOne(
        { _id: channel_id },
        { $pull: { members: user_id } }
    ).exec();
    return result.modifiedCount > 0;
}

export async function saveMessageToChannel(user: FilledUser , channel_id: ObjectID, content: PostMessageParam): Promise<boolean>{
    const message = createMessage(content.content, user)
    const result = await ChannelTable.updateOne(
        { _id: channel_id },
        { $push: { messages: message } }
    ).exec();
    return result.modifiedCount > 0
}

export async function deleteMessageFromChannel(channel_id: ObjectID, message_id: ObjectID): Promise<boolean> {
    const result = await ChannelTable.updateOne(
        { _id: channel_id },
        { $pull: { messages: { _id: message_id } } }
    ).exec();
    return result.modifiedCount > 0;
}


export async function deleteChannelLinkedTOActivity(channel_id: ObjectID, activity_id: ObjectID): Promise<boolean>{
    const res = await ChannelTable.deleteOne({_id: channel_id})

    await UserTable.updateMany(
        { group_channel_list: channel_id },
        { $pull: { group_channel_list: channel_id } }
    );

    const res2 = await ActivityTable.updateOne(
        { _id: activity_id },
        { $set: { channel_chat_id: null } }
    );

    return res.deletedCount > 0 && res2.modifiedCount > 0
}

export async function deleteChannel(channel_id: ObjectID): Promise<boolean>{
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
export function objectToChannel(obj: any): FilledChannel {
    return {
        _id: obj._id?.toString(),
        name: obj.name,
        activity: obj.activity_id ? toActivityObject(obj.activity_id) : null,
        type: obj.type,
        description: obj.description,
        admin: obj.admin_id ? toUserObject(obj.admin_id) : null,
        messages: obj.messages?.map(objectToMessage) ?? [],
        members: Array.isArray(obj.members)
            ? obj.members.map((m: User) => toUserObject(m))
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
function objectToMessage(obj: any): FilledMessage {
    return {
        date: obj.date ? new Date(obj.date) : new Date(),
        content: obj.content,
        author: obj.author_id ? toUserObject(obj.author_id) : null,
        type: obj.type,
    };
}


export function ChannelToPublicChannel(channel: Channel): PublicFilledChannel {
    return {
        _id: channel._id.toString(),
        name: channel.name,
        activity: channel.activity_id ? toActivityObject(channel.activity_id) : null,
        type: channel.type,
        description: channel.description,
        created_at: channel.created_at,
    };
}
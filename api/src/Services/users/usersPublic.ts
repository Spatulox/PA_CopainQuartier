import { UserTable } from "../../DB_Schema/UserSchema";
import { User, PublicUser, FilledUser } from "../../Models/UserModel";
import { objectToChannel } from "../channels/channels";
import { UpdateAccountType, UpdateAdminAccountType } from "../../Validators/users";
import { ObjectID } from "../../DB_Schema/connexion";
import { Channel } from "../../Models/ChannelModel";

export async function getUserById(userId: ObjectID): Promise<FilledUser | null> {
    const obj = await UserTable.findById(userId)
        .populate("group_chat_list_ids")
        .populate("friends_id")
        .exec();
    return toUserObject(obj)
}
export async function getPublicUserById(currentUser: User, targetUserId: ObjectID): Promise<PublicUser | null> {
    const targetUser = await UserTable.findById(targetUserId).populate("group_chat_list_ids").exec();
    if (!targetUser) return null;

    const currentChannels = (currentUser.group_chat_list_ids || []).map(id => id.toString());

    const targetChannels = (targetUser.group_chat_list_ids || []).map((channel: Channel | ObjectID) => {
        if (channel && channel._id) return channel._id.toString();
        return channel.toString();
    });

    const commonChannels = targetChannels.filter(id => currentChannels.includes(id));

    const publicUser: PublicUser = {
        _id: targetUser._id,
        name: targetUser.name,
        lastname: targetUser.lastname,
        verified: targetUser.verified,
        role: targetUser.role,
        group_chat_list_ids: [],
        troc_score: targetUser.troc_score ? targetUser.troc_score.toString() : null,
        common_channels: commonChannels,
        friends_id: [],
        friends_request_id: []
    };

    return publicUser;
}

export async function updateMyAccount(user: User, option: UpdateAccountType): Promise<boolean>{
    try{
        const result = await UserTable.updateOne(
            { _id: user._id },
            { $set: option }
        );
        return result.modifiedCount === 1 || result.matchedCount === 1
    } catch(e: any){
        console.log(e)
        return false
    }
}

export async function deleteMyAccount(user: User): Promise<boolean>{
    const result = await UserTable.deleteOne({_id: user._id}).exec()
    return result.deletedCount > 0;
}



export function toUserObject(doc: User | null, depth: number = 0): FilledUser | null {
    if(doc == null){return null}
    
    return {
        _id: doc._id.toString(),
        name: doc.name,
        lastname: doc.lastname,
        email: doc.email,
        address: doc.address,
        verified: doc.verified,
        role: doc.role,
        group_chat_list_ids: (doc.group_chat_list_ids || []).map((item: any) => objectToChannel(item)),
        troc_score: doc.troc_score ? doc.troc_score.toString() : null,
        phone: doc.phone,
        friends: doc.friends_id ? doc.friends_id : [],
        friends_request: doc.friends_request_id ? doc.friends_request_id : []
    };
}
import { UserTable } from "../../DB_Schema/UserSchema";
import { User, PublicUser } from "../../Models/UserModel";
import { objectToChannel } from "../channels/channels";
import { UpdateAccountType } from "../../Validators/users";
import { ObjectID } from "../../DB_Schema/connexion";

export async function getUserById(userId: ObjectID): Promise<User | null> {
    const obj = await UserTable.findById(userId).populate("group_chat_list_ids").exec();
    return toUserObject(obj)
}
export async function getPublicUserById(currentUser: User, targetUserId: ObjectID): Promise<PublicUser | null> {
    const targetUser = await UserTable.findById(targetUserId).populate("group_chat_list_ids").exec();
    if (!targetUser) return null;

    const currentChannels = (currentUser.group_chat_list_ids || []).map(id => id.toString());

    const targetChannels = (targetUser.group_chat_list_ids || []).map((channel: any) => {
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
    };

    return publicUser;
}

export async function updateMyAccount(user: User, option: UpdateAccountType): Promise<boolean>{
    try{
        const result = await UserTable.updateOne(
            { _id: user._id },
            { $set: option }
        );
        return result.modifiedCount === 1
    } catch(e: any){
        console.log(e)
        return false
    }
}

export async function deleteMyAccount(user: User): Promise<boolean>{
    const result = await UserTable.deleteOne({_id: user._id}).exec()
    return result.deletedCount > 0;
}



export function toUserObject(doc: User | null): User | null {
    if(doc == null){return null}
    return {
        _id: doc._id,
        name: doc.name,
        lastname: doc.lastname,
        email: doc.email,
        password: doc.password,
        address: doc.address,
        verified: doc.verified,
        role: doc.role,
        group_chat_list_ids: (doc.group_chat_list_ids || []).map((item: any) => objectToChannel(item)),
        troc_score: doc.troc_score ? doc.troc_score.toString() : null,
        phone: doc.phone,
    };
}

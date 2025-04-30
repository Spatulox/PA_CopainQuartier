import mongoose from "mongoose";
import { UserTable } from "../../DB_Schema/UserSchema";
import { User, PublicUser } from "../../Models/UserModel";
import { ID } from "../../Utils/IDType";

export async function getUserById(user: User | ID): Promise<User | null> {
    let userId: ID;

    if (typeof user === "object" && "_id" in user) {
        userId = user._id;
    } else {
        userId = user;
    }

    return await UserTable.findById(userId).populate("group_chat_list_ids").exec();
}

export async function getPublicUserById(currentUser: User, targetUserId: ID): Promise<PublicUser | null> {
    const targetUser = await UserTable.findById(targetUserId).populate("group_chat_list_ids").exec();
    if (!targetUser) return null;

    const currentChannels = currentUser.group_chat_list_ids.map(id => id.toString());
    const commonChannels = targetUser.group_chat_list_ids.filter((channel: any) => currentChannels.includes(channel._id.toString()));
      

    const publicUser: PublicUser = {
        _id: targetUser._id,
        name: targetUser.name,
        lastname: targetUser.lastname,
        verified: targetUser.verified,
        role: targetUser.role,
        group_chat_list_ids: targetUser.group_chat_list_ids,
        troc_score: targetUser.troc_score,
        common_channels: commonChannels.map(id => new mongoose.Types.ObjectId(id)),
    };

    return publicUser;
}

export async function deleteMyAccount(user: User): Promise<boolean>{
    const result = await UserTable.deleteOne({_id: user._id}).exec()
    return result.deletedCount > 0;
}
import mongoose from "mongoose";
import { UserTable } from "../../DB_Schema/UserSchema";
import { User, PublicUser } from "../../Models/UserModel";
import { ID } from "../../Utils/IDType";
import { objectToChannel } from "../channels/channels";

export async function getUserById(user: User | ID): Promise<User | null> {
    let userId: ID;

    if (typeof user === "object" && "_id" in user) {
        userId = user._id;
    } else {
        userId = user;
    }

    const obj = await UserTable.findById(userId).populate("group_chat_list_ids").exec();
    return toUserObject(obj)
}
export async function getPublicUserById(currentUser: User, targetUserId: string): Promise<PublicUser | null> {
    const targetUser = await UserTable.findById(targetUserId).populate("group_chat_list_ids").exec();
    if (!targetUser) return null;

    // On s'assure que currentUser.group_chat_list_ids est un tableau de string
    const currentChannels = (currentUser.group_chat_list_ids || []).map(id => id.toString());

    // On extrait les IDs des channels du user cible
    const targetChannels = (targetUser.group_chat_list_ids || []).map((channel: any) => {
        // Si populé, channel est un objet avec un _id
        if (channel && channel._id) return channel._id.toString();
        // Sinon, c'est déjà un ObjectId ou string
        return channel.toString();
    });

    // Liste des channels communs (en string)
    const commonChannels = targetChannels.filter(id => currentChannels.includes(id));

    // Création du DTO PublicUser
    const publicUser: PublicUser = {
        _id: targetUser._id.toString(),
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


export async function deleteMyAccount(user: User): Promise<boolean>{
    const result = await UserTable.deleteOne({_id: user._id}).exec()
    return result.deletedCount > 0;
}



export function toUserObject(doc: User | null): User {
    if(doc == null){return {} as User}
    return {
        _id: doc._id.toString(),
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

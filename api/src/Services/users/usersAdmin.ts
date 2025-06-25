import { ObjectID } from "../../DB_Schema/connexion";
import { UserTable } from "../../DB_Schema/UserSchema";
import { FilledUser, User } from "../../Models/UserModel";
import { UpdateAdminAccountType } from "../../Validators/users";
import { toUserObject } from "./usersPublic";

export async function getAllUsers(): Promise<FilledUser[]> {
    const users = await UserTable.find()
        .populate("group_chat_list_ids")
        .exec();
    return users.map(user => toUserObject(user)).filter(u => u !== null);
}

export async function getUnverifiedUser(): Promise<FilledUser[]> {
    const users = await UserTable.find({ verified: false }).exec();
    return users.map(user => toUserObject(user)).filter(u => u !== null);
}

export async function updateAccountAdmin(user_id: ObjectID, option: UpdateAdminAccountType): Promise<boolean>{
    try{
        const result = await UserTable.updateOne(
            { _id: user_id },
            { $set: option }
        );
        return result.modifiedCount === 1 || result.matchedCount === 1
    } catch(e: any){
        console.error(e)
        return false
    }
}

export async function verifyUser(user_id: ObjectID): Promise<boolean> {
    const res = await UserTable.updateOne(
        { _id: user_id },
        { $set: { verified: true } }
    ).exec();
    return res.modifiedCount > 0;
}


export async function deleteUser(user_id: ObjectID): Promise<boolean>{
    const result = await UserTable.deleteOne({ _id: user_id }).exec();
    return result.deletedCount > 0;
}
import mongoose from "mongoose";
import { UserTable } from "../../DB_Schema/UserSchema";
import { User } from "../../Models/UserModel";
import { ID } from "../../Utils/IDType";
import { toUserObject } from "./usersPublic";

export async function getAllUsers(): Promise<User[]>{
    const users =  await UserTable.find()
    .populate("group_chat_list_ids")
    .exec()
    const finalUsers: User[] = []

    users.forEach(user => {
        finalUsers.push(toUserObject(user))
    })
    return finalUsers
}

export async function getUnverifiedUser(): Promise<User[] | null> {
    const users = await UserTable.find({ verified: false }).exec();
    const finalUsers: User[] = []
    users.forEach(user => {
        finalUsers.push(toUserObject(user))
    })
    return finalUsers
}

export async function verifyUser(user_id: ID): Promise<boolean> {
    const res = await UserTable.updateOne(
        { _id: user_id },
        { $set: { verified: true } }
    ).exec();
    return res.modifiedCount > 0;
}


export async function deleteUser(user_id: ID): Promise<boolean>{
    const result = await UserTable.deleteOne({ _id: user_id }).exec();
    return result.deletedCount > 0;
}
import mongoose from "mongoose";
import { UserTable } from "../../DB_Schema/UserSchema";
import { User } from "../../Models/UserModel";
import { ID } from "../../Utils/IDType";

export async function getAllUsers(): Promise<User[]>{
    return await UserTable.find().populate("group_chat_list_ids").exec()
}

export async function deleteUser(user_id: ID): Promise<boolean>{
    const result = await UserTable.deleteOne({ _id: user_id }).exec();
    return result.deletedCount > 0;
}
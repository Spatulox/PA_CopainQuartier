import mongoose, { ObjectId } from "mongoose";

export type Token = {
    _id: ObjectId,
    token: string,
    userID: ObjectId
}

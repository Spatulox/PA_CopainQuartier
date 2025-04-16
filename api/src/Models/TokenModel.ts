import mongoose from "mongoose";

export interface Token {
    _id: mongoose.Types.ObjectId,
    token: string,
    userID: mongoose.Types.ObjectId
}

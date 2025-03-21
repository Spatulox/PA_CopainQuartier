import mongoose from "mongoose";

export interface Publication {
    _id: mongoose.Types.ObjectId,
    name: string,
    created_at: Date,
    update_at: Date,
    author_id: mongoose.Types.ObjectId,
    activity_id?: mongoose.Types.ObjectId,
    troc_id?: mongoose.Types.ObjectId,
    body: string
}
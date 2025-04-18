import mongoose from "mongoose";

export interface Publication {
    _id: mongoose.Types.ObjectId,
    name: string,
    created_at: Date,
    updated_at: Date,
    author_id: mongoose.Types.ObjectId,
    activity_id?: mongoose.Types.ObjectId,
    body: string
}
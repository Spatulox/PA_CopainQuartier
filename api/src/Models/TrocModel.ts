import mongoose from "mongoose";

export interface Troc {
    _id: mongoose.Types.ObjectId,
    title: string,
    created_at: Date,
    author_id: mongoose.Types.ObjectId,
    reserved_at: Date,
    reserved_by: mongoose.Types.ObjectId,
    status: string,
    type: string,
}

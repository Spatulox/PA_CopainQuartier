import mongoose from "mongoose";

export interface Troc {
    _id: string,
    title: string,
    created_at: Date,
    author_id: string,
    reserved_at: Date,
    reserved_by: string,
    status: string,
    type: string,
}

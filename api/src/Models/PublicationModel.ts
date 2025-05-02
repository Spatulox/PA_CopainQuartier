import mongoose from "mongoose";

export interface Publication {
    _id: string,
    name: string,
    created_at: Date,
    updated_at: Date,
    author_id: string,
    activity_id?: string,
    body: string
}
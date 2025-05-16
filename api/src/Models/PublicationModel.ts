import mongoose, { ObjectId } from "mongoose";
import { Activity, FilledActivity } from "./ActivityModel";
import { User } from "./UserModel";

export interface Publication {
    _id: string,
    name: string,
    created_at: Date,
    updated_at: Date,
    author_id: ObjectId,
    activity_id?: ObjectId,
    body: string
}


export type FilledPublication = Omit<Publication, "activity_id" | "author_id"> & {activity: Activity | FilledActivity | undefined, author: User | null}
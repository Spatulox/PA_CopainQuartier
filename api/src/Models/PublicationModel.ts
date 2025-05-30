import mongoose, { ObjectId } from "mongoose";
import { Activity, FilledActivity } from "./ActivityModel";
import { FilledUser, User } from "./UserModel";

export type Publication = {
    _id: string,
    name: string,
    created_at: Date,
    updated_at: Date,
    author_id: ObjectId | User,
    activity_id?: ObjectId | Activity,
    body: string
}


export type FilledPublication = Omit<Publication, "activity_id" | "author_id"> & {activity: Activity | FilledActivity | undefined, author: User | FilledUser | null}
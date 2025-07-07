import mongoose, { ObjectId } from "mongoose";
import { Activity, FilledActivity } from "./ActivityModel";
import { FilledUser, User } from "./UserModel";
import { ObjectID } from "../DB_Schema/connexion";

export type Publication = {
    _id: ObjectID,
    name: string,
    description: string,
    created_at: Date,
    updated_at: Date,
    author_id: ObjectID | User,
    activity_id?: ObjectID | Activity | null,
    body: string
    image_link?: string | null,
}


export type FilledPublication = Omit<Publication, "activity_id" | "author_id"> & {activity: Activity | FilledActivity | undefined, author: User | FilledUser | null}
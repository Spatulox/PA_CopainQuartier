import mongoose, { ObjectId } from "mongoose";
import { FilledUser, User } from "./UserModel";
import { ObjectID } from "../DB_Schema/connexion";
import { TrocStatusSchema, TrocTypeSchema, TrocVisibilitySchema } from "../Validators/trocs";
import { z } from "zod";
import { FilledChannel } from "./ChannelModel";

export type Troc = {
    _id: ObjectID,
    title: string,
    created_at: Date,
    description: string,
    author_id: ObjectID,
    reserved_at?: Date,
    reserved_by?: ObjectID[],
    updated_at: Date,
    status: TrocStatus | z.infer<typeof TrocStatusSchema>, // compatibilité avec Zod
    type: TrocType | z.infer<typeof TrocTypeSchema>, // compatibilité avec Zod
    visibility : TrocVisibility | z.infer<typeof TrocVisibilitySchema>, // compatibilité avec Zod
    channel_id: ObjectID | null,
    max_user: number | null;
    image_link?: string | null;
}

export enum TrocType {
    service = "service",
    serviceMorethanOnePerson = "serviceMorethanOnePerson",
    item = "item"
}

// Troc visibility set by the owner
export enum TrocVisibility {
    hide = "hide",
    visible = "visible"
}

export enum TrocStatus {
    completed = "completed",
    cancelled = "cancelled",
    hide = "hide", // TrocStatus.hice troc non approve by admin
    pending = "pending",
    reserved = "reserved",
    waitingForApproval = "waitingforapproval",
}

export type FilledTroc = Omit<Troc, "author_id" | "reserved_by" | "channel_id"> & {author: User | FilledUser | null, reserved_by: User | FilledUser | string, channel: FilledChannel | null}
import mongoose, { ObjectId } from "mongoose";
import { FilledUser, User } from "./UserModel";

export type Troc = {
    _id: ObjectId,
    title: string,
    created_at: Date,
    description: string,
    author_id: ObjectId,
    reserved_at: Date,
    reserved_by: ObjectId[],
    status: TrocStatus,
    type: TrocType,
    visibility : TrocVisibility
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

export type FilledTroc = Omit<Troc, "author_id" | "reserved_by"> & {author: User | FilledUser | null, reserved_by: User | FilledUser | string}
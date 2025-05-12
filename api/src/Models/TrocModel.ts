import mongoose from "mongoose";

export interface Troc {
    _id: string,
    title: string,
    created_at: Date,
    description: string,
    author_id: string,
    reserved_at: Date,
    reserved_by: string,
    status: TrocStatus,
    type: TrocType,
    visibility : TrocVisibility
}

export enum TrocType {
    service = "service",
    serviceMorethanOnePerson = "serviceMorethanOnePerson",
    item = "item"
}

export enum TrocVisibility {
    hide = "hide",
    visible = "visible"
}

export enum TrocStatus {
    completed = "completed",
    cancelled = "cancelled",
    hide = "hide",
    pending = "pending",
    reserved = "reserved",
    waitingForApproval = "waitingforapproval",
}
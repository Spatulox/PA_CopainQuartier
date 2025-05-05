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
    visibility : string
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
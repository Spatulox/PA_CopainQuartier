import mongoose, { model, Schema } from "mongoose";
import { JavaModel } from "../Models/JavaModel";

const JavaSchema = new Schema<JavaModel>({
    version: { type: String , required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    filename: {type: String, required: true},
})

export const JavaTable = model('Java', JavaSchema);
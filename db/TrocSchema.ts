import { Schema, model } from 'mongoose';

export const TrocSchema = new Schema({
    title: String,
    created_at: { type: Date, default: Date.now },
    author_id: { type: Schema.Types.ObjectId, ref: "User" },
    reserved_at : { type: Date, default: null },
    reserved_by: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ['service', 'item'] }
});


const Troc = model('Troc', TrocSchema);
import { Schema, model } from 'mongoose';
import { Troc } from '../Models/TrocModel';

const TrocSchema = new Schema<Troc>({
    title: {type: String, required: true},
    created_at: { type: Date, default: Date.now },
    author_id: { type: Schema.Types.ObjectId, ref: "User" },
    description: {type: String, required: true},
    reserved_at : { type: Date, default: null },
    reserved_by: [{ type: Schema.Types.ObjectId, ref: "User" }],
    updated_at: { type: Date },
    status : { type: String, _type: ['pending', 'completed', 'cancelled'] },
    type: { type: String, _type: ['service', 'item'] },
    visibility : {type: String, _type: ['visible', 'hide']},
    channel_id: {type: Schema.Types.ObjectId, ref: "Channel"},
    max_user: {type: Number, default: null, required: false},
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});


export const TrocTable = model('Troc', TrocSchema);
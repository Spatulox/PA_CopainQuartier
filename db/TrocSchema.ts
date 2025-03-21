import { Schema, model } from 'mongoose';

const TrocSchema = new Schema({
    title: {type: String, required: true},
    created_at: { type: Date, default: Date.now },
    author_id: { type: Schema.Types.ObjectId, ref: "User" },
    reserved_at : { type: Date, default: null },
    reserved_by: { type: Schema.Types.ObjectId, ref: "User" },
    status : { type: String, _type: ['pending', 'completed', 'cancelled'] },
    type: { type: String, _type: ['service', 'item'] }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'reserved_at' }
});


export const Troc = model('Troc', TrocSchema);
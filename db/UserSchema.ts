import { Schema, model } from 'mongoose';

export const UserSchema = new Schema({
    name: {type: String, required: true},
    lastname: {type: String, required: true},
    email: {type: String, required: true},
    address: {type: String, required: true},
    verified: {type: Boolean, default: false, required: true},
    role: {type: String, required: true, enum: ['text', 'vocal']},
    group_chat_list_ids: Array<{ type: Schema.Types.ObjectId, ref: "Channel"}>,
    troc_score: Number,
    phone: {type: String, required: true},
});


export const User = model('User', UserSchema);
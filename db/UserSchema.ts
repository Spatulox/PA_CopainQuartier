import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
    name: {type: String, required: true},
    lastname: {type: String, required: true},
    email: {type: String, required: true},
    address: {type: String, required: true},
    verified: {type: Boolean, default: false, required: true},
    role: {type: String, required: true, value: ['admin', 'member']},
    group_chat_list_ids: [{ type: Schema.Types.ObjectId, ref: "Channel"}],
    troc_score: {type: String, default: null, required: false},
    phone: {type: String, required: true},
});


export const User = model('User', UserSchema);
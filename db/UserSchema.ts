import { Schema, model } from 'mongoose';

export const UserSchema = new Schema({
    name: String,
    lastname: String,
    email: String,
    address: String,
    verified: Boolean,
    role: String,
    group_chat_list_id: Array<Number>,
    troc_score: Number,
    phone: String,
});


export const User = model('User', UserSchema);
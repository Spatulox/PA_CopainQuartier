import { Schema, model } from 'mongoose';
import { User } from '../Models/UserModel';

const UserSchema = new Schema<User>({
    name: {type: String, required: true},
    lastname: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    address: {type: String, required: true},
    verified: {type: Boolean, default: false, required: true},
    role: {type: String, required: true, value: ['admin', 'member']},
    group_chat_list_ids: { type: [Schema.Types.ObjectId], ref: "Channel"},
    troc_score: {type: String, default: null, required: false},
    phone: {type: String, required: true},
    //friends_id: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    friends_id: {
        type: Map,
        of: Schema.Types.ObjectId,
        default: new Map(),
    },
    friends_request_id: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    image_link: {type: String, default: null, required: false},
});


export const UserTable = model('User', UserSchema);

export enum UserRole {
    admin = "admin",
    member = "member",
}
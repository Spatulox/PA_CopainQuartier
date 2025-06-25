import { Schema, model } from 'mongoose';
import { Channel, Message } from '../Models/ChannelModel';

const MessageSchema = new Schema<Message>({
    date: {type: Date, required: true},
    content: {type: String, required: true},
    author_id: { type: Schema.Types.ObjectId, ref: "User", required: false },
    type: { type: String, enum: ['system', 'user'], required: true },
})

const ChannelSchema = new Schema<Channel>({
    name: {type: String, required: true},
    activity_id : { type: Schema.Types.ObjectId, ref: "Activity"},
    type: { type: String, _type: ['text', 'vocal'], required: true},
    description : {type: String, required: true},
    admin_id: { type: Schema.Types.ObjectId as any, ref: "User", required: true },
    messages: [MessageSchema],
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    member_auth: { type: String, enum: ['read_send', 'read_only'], required: true },
    created_at : { type: Date, required: true},
    private: { type: Boolean, required: true, default: false },
}, {
    timestamps: { createdAt: 'created_at'}
});

export const ChannelTable = model('Channel', ChannelSchema);

export enum ChannelAuth {
    read_send = "read_send",
    read_only = "read_only"
}
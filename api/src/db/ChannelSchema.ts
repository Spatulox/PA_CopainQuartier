import { Schema, model } from 'mongoose';
import { Channel } from '../Channel/ChannelModel';

const ChannelSchema = new Schema<Channel>({
    name: {type: String, required: true},
    type: { type: String, _type: ['text', 'vocal'], required: true},
    description : {type: String, required: true},
    admin_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    messages: [{ 
        date: {type: Date, required: true},
        content: {type: String, required: true},
        author_id: { type: Schema.Types.ObjectId, ref: "User", required: true }
    }],
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    member_auth: { type: String, _type: ['read_only', 'rend_send'], required: true },
    created_at : {type: Date, required: true},
}, {
    timestamps: { createdAt: 'created_at'}
});

export const ChannelRepository = model('Channel', ChannelSchema);
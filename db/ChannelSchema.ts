import { Schema, model } from 'mongoose';

export const ChannelSchema = new Schema({
    name: {type: String, required: true},
    type: { type: String, enum: ['text', 'vocal'] },
    description : {type: String, required: true},
    admin_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    messages: Array<Message>,
});

interface Message {
    date: {type: Date, required: true};
    content: {type: String, required: true};
    author_id: { type: Schema.Types.ObjectId, ref: "User", required: true };
}


export const Channel = model('Channel', ChannelSchema);
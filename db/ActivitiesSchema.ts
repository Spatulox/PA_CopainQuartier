import { Schema, model } from 'mongoose';

const ActivitySchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    created_at: { type: Date, default: Date.now, required: true },
    date_reservation: { type: Date, default: Date.now },
    author_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    channel_chat_id: { type: Schema.Types.ObjectId, ref: "Channel", required: true },
    publication_id: { type: Schema.Types.ObjectId, ref: "Publication", required: true },
    participants_id: [{ type: Schema.Types.ObjectId, ref: "User" }]
},{ timestamps: 
    { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Activity = model('Activity', ActivitySchema);

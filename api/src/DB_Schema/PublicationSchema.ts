import { Schema, model } from 'mongoose';
import { Publication } from '../Models/PublicationModel';

const PublicationSchema = new Schema<Publication>({
    name: {type: String, required: true},
    created_at: { type: Date, default: Date.now, required: true },
    updated_at: { type: Date, default: null },
    author_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    activity_id : { type: Schema.Types.ObjectId, ref: "Activity", required: false },
    body: {type: String, required: true}
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const PublicationTable = model('Publication', PublicationSchema);
import { Schema, model } from 'mongoose';
import { Publication } from '../Models/PublicationModel';
import { ObjectID } from './connexion';

const PublicationSchema = new Schema<Publication>({
    name: {type: String, required: true},
    created_at: { type: Date, default: Date.now, required: true },
    description: {type: String, required: true},
    updated_at: { type: Date, default: null },
    author_id: { type: ObjectID, ref: "User", required: true },
    activity_id : { type: ObjectID, ref: "Activity", required: false },
    body: {type: String, required: true},
    image_link: { type: String, default: null, required: false },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const PublicationTable = model('Publication', PublicationSchema);
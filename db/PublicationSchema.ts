import { Schema, model } from 'mongoose';

const PublicationSchema = new Schema({
    name: {type: String, required: true},
    created_at: { type: Date, default: Date.now, required: true },
    updated_at: { type: Date, default: null },
    author_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    activity_id : { type: Schema.Types.ObjectId, ref: "Activities", required: false },
    troc_id: { type: Schema.Types.ObjectId, ref: "Troc", required: false },
    body: {type: String, required: true}
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

PublicationSchema.pre('validate', function(next) {
    if (this.activity_id && this.troc_id) {
        next(new Error('Une publication ne peut pas être liée à la fois à une activité et à un troc.'));
    } else {
        next();
    }
});

export const Publication = model('Publication', PublicationSchema);
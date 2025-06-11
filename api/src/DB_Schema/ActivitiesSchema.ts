import { Schema, model } from 'mongoose';
import { Activity } from '../Models/ActivityModel';

const ActivitySchema = new Schema<Activity>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    created_at: { type: Date, default: Date.now, required: true },
    date_reservation: { type: Date, default: Date.now },
    date_end: {type: Date, default: 0, required: true},
    author_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    channel_chat_id: { type: Schema.Types.ObjectId , ref: "Channel", default: null },
    publication_id: { type: Schema.Types.ObjectId, ref: "Publication", required: true },
    participants_id: [{ type: Schema.Types.ObjectId, ref: "User" }],
    location: {type: String, required: true},
    max_place: {type: Number, required: true},
    reserved_place: {
        type: Number,
        required: true,
        min: 0,
        validate: {
        validator: function(value) {
            return value <= this.max_place;
        },
        message: props => `Le nombre de place maximal est déjà atteind..`
        }
    }
},{ timestamps: 
    { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const ActivityTable = model('Activity', ActivitySchema);

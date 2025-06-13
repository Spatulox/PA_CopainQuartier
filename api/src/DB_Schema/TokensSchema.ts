import { Schema, model } from 'mongoose';
import { Token } from '../Models/TokenModel';

const TokenSchema = new Schema<Token>({
    token: {type: String, required: true},
    userID: { type: Schema.Types.ObjectId, ref: "User" },
})

export const TokenTable = model('Token', TokenSchema);
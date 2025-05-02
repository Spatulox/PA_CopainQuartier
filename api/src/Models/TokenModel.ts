import mongoose from "mongoose";

export interface Token {
    _id: string,
    token: string,
    userID: string
}

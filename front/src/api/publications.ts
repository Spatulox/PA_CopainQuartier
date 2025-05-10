import { ApiClient } from "./client"

export type Publication = {
    _id: string,
    name: string,
    created_at: Date,
    updated_at: Date,
    author_id: string,
    activity_id: string,
    body: string
}


export class PublicationClass extends ApiClient{
    private url = "/publications"
}
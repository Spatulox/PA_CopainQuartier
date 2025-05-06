import { ApiClient } from "./client";
import { Publication } from "./publications";
import { User } from "./user";

export type Activity = {
    _id: string,
    title: string,
    description: string,
    created_at: Date,
    date_reservation: Date,
    author_id: User,
    channel_chat_id: string,
    publication: Publication,
    participants: User[]
}

export class ActivityClass extends ApiClient{
    private url = "/activities"

    async getActivities():Promise<Activity[]>{
        const activity = await this.Get(this.url)
        return activity.data
    }

    async createActivities(option: any): Promise<boolean>{
        return await this.Post(this.url, option)
    }
}
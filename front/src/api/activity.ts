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

    async getActivityByID(id: string):Promise<Activity>{
        const activity = await this.Get(`${this.url}/${id}`)
        return activity.data
    }

    async getMyActivities():Promise<Activity[]>{
        const activity = await this.Get(`${this.url}/@me`)
        return activity.data
    }

    async getAllActivitiesAdmin():Promise<Activity[]>{
        const activity = await this.Get(`admin${this.url}/`)
        return activity.data
    }

    async getactivityAdminById(id: string):Promise<Activity>{
        const activity = await this.Get(`admin${this.url}/${id}`)
        return activity.data
    }

    async createActivities(option: any): Promise<boolean>{
        return await this.Post(this.url, option)
    }
}
import { Channel } from "./chat";
import { ApiClient, Query } from "./client";
import { Publication } from "./publications";
import { User } from "./user";

export type Activity = {
    _id: string,
    title: string,
    description: string,
    created_at: Date,
    date_reservation: Date,
    date_end: Date,
    author: User,
    channel_chat: Channel,
    publication: Publication,
    participants: User[],
    location: string,
    max_place: number,
    reserved_place: number,
    image_link?: string | null,
}

export class ActivityClass extends ApiClient{
    protected url = "/activities"

    async getActivities():Promise<Activity[]>{
        const activity = await this.Get(this.url)
        return activity//.data
    }

    async getActivityByID(id: string):Promise<Activity>{
        const activity = await this.Get(`${this.url}/${id}`)
        return activity//.data
    }

    async getMyActivities():Promise<Activity[]>{
        const activity = await this.Get(`${this.url}/@me`)
        return activity//.data
    }

    async getMyActivitiesWithoutChannel(query?: Query): Promise<Activity[]>{
        return await this.Get(`${this.url}/@me`, query)
    }

    async createActivities(option: FormData): Promise<Activity | null>{
        return await this.Post(this.url, option)
    }

    async updateActivity(id: string, option: object): Promise<void>{
        await this.Patch(`${this.url}/${id}`, option)
    }

    async deleteActivity(id: string): Promise<void>{
        await this.Delete(`${this.url}/${id}`)
    }

    async joinActivity(id: string): Promise<void>{
        await this.Patch(`${this.url}/${id}/join`, {})
    }

    async leaveActivity(id: string): Promise<void>{
        await this.Patch(`${this.url}/${id}/leave`, {})
    }
}

export class AdminActivityClass extends ActivityClass{

    protected urlAdmin = "/admin/activities"

    constructor() {
        super();
        this.refreshUser().then(() => {
            if (!this.isAdmin()) {
                throw new Error("User is not admin");
            }
        })
    }

    async getAllActivitiesAdmin():Promise<Activity[]>{
        const activity = await this.Get(`${this.urlAdmin}/`)
        return activity//.data
    }

    async getActivityAdminById(id: string):Promise<Activity>{
        const activity = await this.Get(`${this.urlAdmin}/${id}`)
        return activity//.data
    }

}
import { Activity } from "./activity"
import { ApiClient } from "./client"
import { User } from "./user"

export type Publication = {
    _id: string,
    name: string,
    created_at: Date,
    updated_at: Date,
    author: string | User,
    activity: string | Activity,
    body: string
}

export class PublicationClass extends ApiClient{
    protected url = "/publications"

    async getAllPublications(): Promise<Publication[]>{
        return await this.Get(this.url)
    }

    async getMyPublications(): Promise<Publication[]>{
        return await this.Get(`${this.url}/@me`)
    }

    async getPublicationById(id:string): Promise<Publication>{
        return await this.Get(`${this.url}/${id}`)
    }

    async createPublication(option: any){
        return await this.Post(`${this.url}`, option)
    }

    async updatePublication(id: string, option: any){
        return await this.Patch(`${this.url}/${id}`, option)
    }

    async deletePublication(id: string){
        return await this.Delete(`${this.url}/${id}`)
    }
}

export class AdminPublicationClass extends PublicationClass{
    protected urlAdmin = "/publications"

    constructor() {
        super();
        this.refreshUser().then(() => {
            if (!this.isAdmin()) {
                throw new Error("User is not admin");
            }
        })
    }
}
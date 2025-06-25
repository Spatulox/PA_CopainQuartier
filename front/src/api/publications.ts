import { Activity } from "./activity"
import { ApiClient } from "./client"
import { User } from "./user"

export type Publication = {
    _id: string,
    name: string,
    description: string,
    created_at: Date,
    updated_at: Date,
    author: User | null,
    activity: Activity | undefined,
    body: string
    image_link?: string | null,
}

export class PublicationClass extends ApiClient{
    protected url = "/publications"

    async getAllPublications(): Promise<Publication[]>{
        return await this.Get(this.url)
    }

    async getAllPublicationsViaActivityID(activity_id: string): Promise<Publication[]>{
        return await this.Get(`${this.url}/activity/${activity_id}`)
    }

    async getMyPublications(): Promise<Publication[]>{
        return await this.Get(`${this.url}/@me`)
    }

    async getPublicationById(id:string): Promise<Publication>{
        return await this.Get(`${this.url}/${id}`)
    }

    async createPublication(option: any): Promise<Publication | null>{
        return await this.Post(`${this.url}`, option)
    }

    async updatePublication(id: string, option: any): Promise<void>{
        await this.Patch(`${this.url}/${id}`, option)
    }

    async deletePublication(id: string): Promise<void>{
        await this.Delete(`${this.url}/${id}`)
    }
}

export class AdminPublicationClass extends PublicationClass{
    protected urlAdmin = "/admin/publications"

    constructor() {
        super();
        this.refreshUser().then(() => {
            if (!this.isAdmin()) {
                throw new Error("User is not admin");
            }
        })
    }

    async getAdminAllPublication(): Promise<Publication[]>{
        return await this.Get(this.urlAdmin)
    }
    
    async getAdminPublicationById(id:string): Promise<Publication>{
        return await this.Get(`${this.urlAdmin}/${id}`)
    }
}
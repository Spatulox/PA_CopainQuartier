import { Activity } from "./activity";
import { Channel } from "./chat";
import { ApiClient } from "./client";


export enum UserRole {
    admin = "admin",
    member = "member",
}

export type User = {
  _id: string,
  name: string,
  lastname: string,
  email: string,
  address: string,
  verified: boolean,
  role: string,
  group_chat_list_ids: Channel[],
  common_channels?: Channel[],
  common_activity?: Activity[],
  troc_score?: string | number | null,
  phone: string,
  friends: Record<string, string>
  friends_request: string[]
  image_link?: string | null,
} | null

export class UserClass extends ApiClient{
    protected url = "/users"

    async getUsers(): Promise<User[]>{
        return await this.Get(this.url)
    }

    async getUserByID(id: string): Promise<User>{
        return await this.Get(`${this.url}/${id}`)
    }

    async deleteUser(id: string): Promise<void>{
        await this.Delete(`${this.url}/${id}`)
    }
}

export class AdminUserClass extends UserClass{
    protected urlAdmin = "/admin/users"

    constructor() {
        super();
        this.refreshUser().then(() => {
            if (!this.isAdmin()) {
                throw new Error("User is not admin");
            }
        })
    }

    async getUsers(): Promise<User[]>{
        return await this.Get(this.urlAdmin)
    }

    async getUserByID(id: string): Promise<User>{
        return await this.Get(`${this.urlAdmin}/${id}`)
    }
    
    async getUnverifiedUsers(): Promise<User[]>{
        return await this.Get(`${this.urlAdmin}/unverified`)
    }

    async verifyUser(id: string, option: object): Promise<void>{
        await this.Patch(`${this.urlAdmin}/${id}/verify`, option)
    }

    async updateUserAdmin(id: string, data: any): Promise<void> {
    await this.Patch(`${this.urlAdmin}/${id}`, data);
  }
}
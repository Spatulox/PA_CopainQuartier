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
  password: string,
  address: string,
  verified: boolean,
  role: string,
  group_chat_list_ids: [],
  common_channels?: [],
  troc_score: string | number | null,
  phone: string
} | null


export class UserClass extends ApiClient{
    protected url = "/users"

    async getUsers(): Promise<User[]>{
        return await this.Get(this.url)
    }

    async getUserByID(id: string): Promise<User>{
        return await this.Get(`${this.url}/${id}`)
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
        return await this.Patch(`${this.urlAdmin}/${id}`, option)
    }

    async deleteUser(id: string): Promise<void>{
        return await this.Delete(`${this.urlAdmin}/${id}`)
    }
}
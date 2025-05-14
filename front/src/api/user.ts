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
  troc_score: string | number | null,
  phone: string
} | null


export class UserClass extends ApiClient{
    protected url = "/users"

    async getUsers(): Promise<User>{
        console.log( await this.Get(this.url))
        return {} as User
    }

    async getUserByID(id: string): Promise<User>{
        console.log( await this.Get(`${this.url}/${id}`))
        return {} as User
    }
}

export class AdminUserClass extends ApiClient{
    protected url = "/admin/users"

    constructor() {
        super();
        this.refreshUser().then(() => {
            if (!this.isAdmin()) {
                throw new Error("User is not admin");
            }
        })
    }

    async getUsers(): Promise<User[]>{
        return await this.Get(this.url)
    }

    async getUserByID(id: string): Promise<User>{
        return await this.Get(`${this.url}/${id}`)
    }
    
    async getUnverifiedUsers(): Promise<User[]>{
        return await this.Get(`${this.url}/unverified`)
    }

    async verifyUser(id: string, option: object): Promise<Boolean>{
        return await this.Patch(`${this.url}/${id}`, option)
    }

    async deleteUser(id: string): Promise<Boolean>{
        return await this.Delete(`${this.url}/${id}`)
    }
}
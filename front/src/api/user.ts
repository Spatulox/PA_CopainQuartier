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
    private url = "/users"

    async getUsers(): Promise<User>{
        console.log( await this.Get(this.url))
        return {} as User
    }

    async getUserByID(id: string): Promise<User>{
        console.log( await this.Get(`${this.url}/${id}`))
        return {} as User
    }
}
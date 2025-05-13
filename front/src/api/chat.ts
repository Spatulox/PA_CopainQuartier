import { Activity } from "./activity";
import { ApiClient } from "./client";
import { Publication } from "./publications";
import { User } from "./user";

export type Message = {
  content: string;
  // autres champs si besoin
};

export type Channel = {
    _id: string;
    activity: Activity | null
    owner: User
    name: string;
    type: string,
    description: string,
    created_at: string
    member_auth: string,
    member: string[]
    messages: string[]
};

export class ChatClass extends ApiClient {

  private url ="/channels"
  
  async getChannelById(id: string): Promise<Channel> {
      const response = await this.Get(`${this.url}/${id}`);
      return response//.data;
  }

  async getChannel(): Promise<Channel[]> {
      const response = await this.Get(`${this.url}/@me`);
      return response//.data;
  }

  async createChat(option: any): Promise<Channel | null> {
    const response = await this.Post(`${this.url}`, option)
    return response//.data
  }

  async deleteChat(channel_id: string): Promise<boolean>{
    return await this.Delete(`${this.url}/${channel_id}`)
  }

  async leaveChat(id: string): Promise<boolean>{
    return await this.Patch(`${this.url}/${id}/removeuser/${this.user?._id}`, {})
  }

  async joinChat(channel_id: string, user_id_to_add: string): Promise<boolean>{
    return await this.Patch(`${this.url}/${channel_id}/adduser/${user_id_to_add}`, {})
  }
}
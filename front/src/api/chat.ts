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
    admin: User
    name: string;
    type: string,
    description: string,
    created_at: string
    member_auth: string,
    members: string[]
    messages: string[]
};

export type PublicChannel = {
  _id: string;
  name: string;
  activity: Activity;
  type: string;
  description: string;
  created_at: Date;
}

export class ChatClass extends ApiClient {

  protected url ="/channels"
  
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

  async deleteChat(channel_id: string): Promise<void>{
    return await this.Delete(`${this.url}/${channel_id}`)
  }

  async leaveChat(id: string): Promise<void>{
    return await this.Patch(`${this.url}/${id}/removeuser/${this.user?._id}`, {})
  }

  async joinChat(channel_id: string, user_id_to_add: string): Promise<void>{
    return await this.Patch(`${this.url}/${channel_id}/adduser/${user_id_to_add}`, {})
  }
}


export class AdminChatClass extends ChatClass{
  protected urlAdmin ="/admin/channels"

  async getAllChannel(): Promise<Channel[]>{
    return await this.Get(this.urlAdmin)
  }
}
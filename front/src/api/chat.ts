import { popup } from "../app/scripts/popup-slide";
import { Activity } from "./activity";
import { ApiClient } from "./client";
import { Publication } from "./publications";
import { Troc } from "./troc";
import { User } from "./user";

export enum MsgType {
  INIT = "INIT",
  HISTORY = "HISTORY",
  MESSAGE = "MESSAGE",
  ERROR = "ERROR",
  OFFER = "OFFER",
  ANSWER = "ANSWER",
  CANDIDATE = "ICE-CANDIDATE",
  JOIN_VOCAL = "JOIN_VOCAL",
  LEAVE_VOCAL = "LEAVE_VOCAL",
  INIT_CONNECTION = "INIT_CONNECTION", // For the "connected" state (online/offline)
  CONNECTED_CHANNEL = "CONNECTED_CHANNEL",
  CONNECTED = "CONNECTED" // For the "connected" state (online/offline)
}

export type Message = {
  content: string;
  username: string;
  type: MsgType
  date: Date;
  image_link: string | null | undefined
  // autres champs si besoin
};

export type Channel = {
    _id: string;
    activity: Activity | null
    troc: Troc | null,
    admin: User
    name: string;
    type: string,
    description: string,
    created_at: string
    member_auth: string,
    members: User[] | string[]
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
    await this.Delete(`${this.url}/${channel_id}`)
  }

  async leaveChat(id: string): Promise<void>{
    if(!this.user?._id){
      popup("Erreur, veuiller vous déconnecter puis vous reconnecter pour faire cette action...")
      return
    }
    await this.Patch(`${this.url}/${id}/removeuser/${this.user?._id}`, {})
  }

  async joinChat(channel_id: string, user_id_to_add: string): Promise<void>{
    await this.Patch(`${this.url}/${channel_id}/adduser/${user_id_to_add}`, {})
  }
}


export class AdminChatClass extends ChatClass{
  protected urlAdmin ="/admin/channels"

  async getAllChannel(): Promise<Channel[]>{
    return await this.Get(this.urlAdmin)
  }
}
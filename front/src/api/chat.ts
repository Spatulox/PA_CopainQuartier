import { ApiClient } from "./client";

export type Message = {
  content: string;
  // autres champs si besoin
};

export type Channel = {
    _id: string;
    activity_id: string
    admin_id: string
    name: string;
    pulication_id: string | null,
    type: string,
    description: string,
    created_at: string
    member_auth: string,
    member: string[]
    messages: string[]
  };

export class Chat extends ApiClient {
    async getChannelById(id: string): Promise<Channel> {
        const response = await this.Get(`/channels/${id}`);
        return response.data;
    }

    async getChannel(): Promise<Channel[]> {
        const response = await this.Get(`/channels/@me`);
        return response.data;
    }

    async deleteChat(channel_id: string): Promise<boolean>{
      return await this.Delete(`/channels/${channel_id}`)
    }

    async leaveChat(id: string): Promise<boolean>{
      return await this.Patch(`/channels/${id}/removeuser/${this.user?._id}`, {})
    }

    async joinChat(channel_id: string, user_id_to_add: string): Promise<boolean>{
      return await this.Patch(`/channels/${channel_id}/adduser/${user_id_to_add}`, {})
    }
}
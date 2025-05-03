import { ApiClient } from "./client";

export type Message = {
  content: string;
  // autres champs si besoin
};

export type Channel = {
    _id: string;
    name: string;
    pulication_id: string | null,
    type: string,
    decription: string,
    created_at: string
  };
  

export class Chat extends ApiClient {
    async getChannelById(id: string): Promise<Channel> {
        const response = await this.client.get(`/channels/${id}`);
        return response.data;
    }

    async getChannel(): Promise<Channel[]> {
        const response = await this.client.get(`/channels/@me`);
        return response.data;
    }
}
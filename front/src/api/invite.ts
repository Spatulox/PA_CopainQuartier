import { Channel } from "./chat";
import { ApiClient } from "./client";

export type Invite = {
    _id: string,
    channel: Channel
}

export type PublicInvite = {
    _id: string,
    channel_id: string
}


export class InviteClass extends ApiClient {
    protected url ="/invites"

    async getInvite(id: string): Promise<Invite>{
        return await this.Get(`${this.url}/${id}`)
    }

    async generateInvite(id: string): Promise<string>{
        let res = await this.Post(`${this.url}`, {channel_id: id})
        if("channel_id" in res){
            res = res as PublicInvite
            return `${this.baseURL}${this.url}/${res.channel_id}`
        }
        return res
    }

    async joinByInvite(id: string): Promise<void>{
        return await this.Post(`${this.url}/${id}`, {})
    }
}
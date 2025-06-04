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

    async getInvite(invite_id: string): Promise<Invite>{
        return await this.Get(`${this.url}/${invite_id}`)
    }

    async generateInvite(id_to_link_to_an_invite: string): Promise<string>{
        let res = await this.Post(`${this.url}`, {channel_id: id_to_link_to_an_invite})
        if("channel_id" in res){
            res = res as PublicInvite
            return `${window.location.origin}${this.url}/${res._id}`
        }
        return res
    }

    async joinByInvite(invite_id: string): Promise<void>{
        return await this.Post(`${this.url}/${invite_id}`, {})
    }
}
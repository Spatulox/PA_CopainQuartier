import { ActivityClass } from "./activity";
import { ApiClient } from "./client";
import { User } from "./user";

export class FriendsClass extends ApiClient{

    protected url = "/friends"

    async getMyFriends():Promise<User | null>{
        return await this.Get(`${this.url}/`)
    }

    async validateAFriendsRequest(id: string): Promise<void>{
        await this.Patch(`${this.url}/${id}/validate`, {})
    }

    async rejectAFriendsRequest(id: string): Promise<void>{
        await this.Patch(`${this.url}/${id}/reject`, {})
    }

    async sendAFriendsRequest(id: string): Promise<void>{
        await this.Patch(`${this.url}/${id}/request`, {})
    }

    async deleteAFriends(id: string): Promise<void>{
        await this.Delete(`${this.url}/${id}`)
    }
}
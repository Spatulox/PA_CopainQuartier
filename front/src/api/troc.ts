import { Channel } from "./chat";
import { ApiClient } from "./client";
import { User } from "./user";

export type Troc = {
    _id: string,
    title: string,
    created_at: Date,
    description: string,
    author: User,
    reserved_at: Date,
    reserved_by: User[],
    updated_at: Date,
    status: TrocStatus,
    type: TrocType,
    visibility : TrocVisibility,
    channel: Channel | null,
    image_link?: string | null,
}

export enum TrocVisibility {
    hide = "hide",
    visible = "visible"
}

export enum TrocStatus {
    completed = "completed",
    cancelled = "cancelled",
    hide = "hide",
    pending = "pending",
    reserved = "reserved",
    waitingForApproval = "waitingforapproval",
}

export enum TrocType {
    service = "service",
    serviceMorethanOnePerson = "serviceMorethanOnePerson",
    item = "item"
}


export class TrocClass extends ApiClient{
    protected url = "/trocs"

    async getAllTrocs(): Promise<Troc[]>{
        return await this.Get(`${this.url}`)
    }

    async getAllMyTrocs(): Promise<Troc[]>{
        return await this.Get(`${this.url}/@me`)
    }

    async getAllTrocsApplied(): Promise<Troc[]>{
        return await this.Get(`${this.url}/@me?applied=true`)
    }

    async getTrocByID(id: string): Promise<Troc>{
        return await this.Get(`${this.url}/${id}`)
    }

    async createTroc(option: object): Promise<Troc | null>{
        return await this.Post(this.url, option)
    }

    async updateTroc(id: string, option: any): Promise<void>{
        await this.Patch(`${this.url}/${id}`, option)
    }

    async completeTroc(id: string): Promise<void>{
        await this.Patch(`${this.url}/${id}/complete`, {})
    }

    async leaveTroc(id: string): Promise<void>{
        await this.Patch(`${this.url}/${id}/leave`, {})
    }

    async reservedTroc(id: string): Promise<void>{
        await this.Patch(`${this.url}/${id}/reserve`, {})
    }

    async cancelTroc(id: string): Promise<void>{
        await this.Patch(`${this.url}/${id}/cancel`, {})
    }

    async deleteTroc(id: string): Promise<void>{
        await this.Delete(`${this.url}/${id}`)
    }
}

export class AdminTrocClass extends TrocClass{
    protected urlAdmin: string = "/admin/trocs"

    constructor() {
        super();
        this.refreshUser().then(() => {
            if (!this.isAdmin()) {
                throw new Error("User is not admin");
            }
        })
    }

    async getWaitingTroc(): Promise<Troc[]>{
        return await this.Get(`${this.urlAdmin}`)
    }

    async getAllAdminTroc(): Promise<Troc[]>{
        return await this.Get(`${this.urlAdmin}/all`)
    }
    
    async getAdminTrocByID(id: string) : Promise<Troc>{
        return await this.Get(`${this.urlAdmin}/${id}`)
    }

    async approveTroc(id: string, option: object): Promise<void>{
        await this.Patch(`${this.urlAdmin}/${id}/approve`, option)
    }
}
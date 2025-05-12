import { ApiClient } from "./client";

export type Troc = {
    _id: string,
    title: string,
    created_at: Date,
    author_id: string,
    reserved_at: Date,
    reserved_by: string,
    status: string,
    type: string,
    visibility : string
}

export class TrocClass extends ApiClient{
    protected url = "/trocs"

    async getAllTrocs(): Promise<Troc[]>{
        return await this.Get(`${this.url}`)
    }

    async getAllMyTrocs(): Promise<Troc[]>{
        return await this.Get(`${this.url}/@me`)
    }

    async getTrocByID(id: string): Promise<Troc>{
        return await this.Get(`${this.url}/${id}`)
    }

    async createTroc(option: any){
        return await this.Post(this.url, option)
    }

    async updateTroc(id: string, option: any): Promise<Troc>{
        return await this.Patch(`${this.url}/${id}`, option)
    }

    async deleteTroc(id: string){
        return await this.Delete(`${this.url}/${id}`)
    }
}

export class AdminTrocClass extends TrocClass{
    protected url: string = "/admin/trocs"

    constructor() {
        super();
        if (!this.isAdmin()) {
            throw new Error("User is not admin");
        }
    }
    
    async getAdminTroc(){
        return await this.Get(`${this.url}`)
    }
    
    async getAdminTrocByID(id: string){
        return await this.Get(`${this.url}/${id}`)
    }
}
import { ApiClient } from "./client";

export type Result = {
  message: string;
  query: string;
  rows: Array<{ id: number; name: string }>;
};


export class AdminLangajeClass extends ApiClient{
    protected urlAdmin = "/admin/langaje"

    constructor() {
        super();
        this.refreshUser().then(() => {
            if (!this.isAdmin()) {
                throw new Error("User is not admin");
            }
        })
    }

    async requestLangaje(query: string): Promise<Result> {
        return await this.Post(this.urlAdmin, { query });
    }
}
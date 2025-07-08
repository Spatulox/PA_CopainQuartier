import { ApiClient } from "./client"

export type Java = {
  _id: string;
  version: string;
  filename: string,
  createdAt: string;
};

export class JavaClass extends ApiClient {
    protected url ="/java"

    async getJavaVersion(): Promise<Java[]>{
        return await this.Get(`${this.url}/version`)
    }

    async downloadJavaApp(version: "win" | "linux"){
        return await this.Get(`${this.url}/executable/${version}`)
    }
}


export class AdminJavaClass extends JavaClass{

    protected urlAdmin = "/java"

    constructor() {
        super();
        this.refreshUser().then(() => {
            if (!this.isAdmin()) {
                throw new Error("User is not admin");
            }
        })
    }

    async uploadNewJavaVersion(data: FormData){
        return await this.Post(`${this.urlAdmin}`, data)
    }
}
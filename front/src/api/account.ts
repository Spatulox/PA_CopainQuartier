import { ActivityClass } from "./activity";
import { User } from "./user";

export class AccountClass extends ActivityClass{

    protected url = "/account"

    async getMyAccount():Promise<User | null>{
        return await this.Get(`${this.url}/`)
    }

    async updateAccount(option: object): Promise<void>{
        await this.Patch(`${this.url}/`, option)
    }

    async deleteAccount(): Promise<void>{
        await this.Delete(`${this.url}/`)
    }

}
import { ActivityClass } from "./activity";
import { User, UserClass } from "./user";

export class AccountClass extends UserClass{

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
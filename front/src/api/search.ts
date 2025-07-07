import { Activity } from "./activity";
import { ApiClient } from "./client";
import { Publication } from "./publications";
import { Troc } from "./troc";

export type SearchReturn = {
    activity: Activity[],
    publication: Publication[]
    troc: Troc[]
}

export class SearchClass extends ApiClient{
    protected url = "/searches"

    async searchData(data: any): Promise<SearchReturn>{
        return await this.Get(this.url, {data})
    }
}
import { Activity } from "./activity";
import { ApiClient } from "./client";
import { Publication } from "./publications";
import { Troc } from "./troc";

type SearchReturn = {
    activity: Activity[],
    publication: Publication[]
    troc: Troc[]
}

export class SearchClass extends ApiClient{
    protected url = "/searches"

    async searchData(data: any): Promise<SearchReturn>{
        const dat = await this.Get(this.url, {data})
        console.log(dat)
        return dat
    }
}
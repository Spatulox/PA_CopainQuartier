import { Response } from "express";
import { Get, Param, Res, JsonController, NotFoundError, InternalServerError, QueryParams } from "routing-controllers";
import { existsSync } from "fs";
import { join } from "path";
import { JavaModel } from "../Models/JavaModel";
import { JavaTable } from "../DB_Schema/JavaSchema";
import { zSearchData } from "../Validators/search";
import { Activity, FilledActivity } from "../Models/ActivityModel";
import { FilledPublication, Publication } from "../Models/PublicationModel";
import { FilledTroc, Troc } from "../Models/TrocModel";
import { searchDataFromPrincipalSearchBar } from "../Services/search/search";


export type SearchReturn = {
    activity?: FilledActivity[] | null,
    publication?: FilledPublication[] | null,
    troc?: FilledTroc[] | null
}


@JsonController("/searches")
export class SearchController {

    @Get("/")
        async getsearchbarinfo(@QueryParams() params?: any): Promise<SearchReturn> {
        try {
            const validParams = zSearchData.parse(params)
            return await searchDataFromPrincipalSearchBar(validParams)
        } catch (err) {
            throw new InternalServerError("Error retrieving Infos version");
        }
    }
}
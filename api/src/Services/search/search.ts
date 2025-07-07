import { SearchReturn } from "../../Controllers/SearchController";
import { ActivityTable } from "../../DB_Schema/ActivitiesSchema";
import { PublicationTable } from "../../DB_Schema/PublicationSchema";
import { TrocTable } from "../../DB_Schema/TrocSchema";
import { SearchParam } from "../../Validators/search";
import { toActivityObject } from "../activities/activities";
import { objectToPublication } from "../publications/publications";
import { toTrocObject } from "../trocs/trocs";

export async function searchDataFromPrincipalSearchBar(param: SearchParam): Promise<SearchReturn> {
  const searchText = param.data?.trim() || "";

  const regex = new RegExp(searchText, "i");

  const [activities, publications, trocs] = await Promise.all([
    ActivityTable.find({
      $or: [
        { title: regex },
        { location: regex }
      ]
    })
      .sort({ created_at: -1 })
      .limit(20),

    PublicationTable.find({
      $or: [
        { name: regex },
        { description: regex },
      ]
    })
      .sort({ created_at: -1 })
      .limit(20),

    TrocTable.find({
      $or: [
        { title: regex },
        { description: regex }
      ]
    })
      .sort({ created_at: -1 })
      .limit(20)
  ]);

  const res: SearchReturn = {
    activity : activities ? activities.map(toActivityObject) : null,
    publication : publications ? publications.map(objectToPublication) : null,
    troc : trocs ? trocs.map(toTrocObject) : null,
  }
  return res
}

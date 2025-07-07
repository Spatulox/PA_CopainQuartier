import { ActivityTable } from "../../DB_Schema/ActivitiesSchema";
import { ObjectID } from "../../DB_Schema/connexion";
import { PublicFilledActivity } from "../../Models/ActivityModel";
import { User } from "../../Models/UserModel";
import { ChannelToPublicChannel } from "../channels/channels";
import { ActivityToPublicActivity, toActivityObject } from "./activities";

export async function getCommonActivity(user1: User, user2: ObjectID): Promise<PublicFilledActivity[]> {
    const activities = await ActivityTable.find({
        participants_id: { $all: [user1._id, user2] }
    })
    .populate("author_id")
    .populate("publication_id")
    .exec()

    const publicFilledActivities: PublicFilledActivity[] = activities
    .map(act => ActivityToPublicActivity(toActivityObject(act)))
    .filter((act): act is PublicFilledActivity => act !== null);


    return publicFilledActivities;
}

import { ChannelTable } from "../../DB_Schema/ChannelSchema";
import { ObjectID } from "../../DB_Schema/connexion";
import { PublicFilledChannel } from "../../Models/ChannelModel";
import { User } from "../../Models/UserModel";
import { ChannelToPublicChannel } from "./channels";

export async function getCommonChannels(user1: User, user2: ObjectID): Promise<PublicFilledChannel[]> {
    const channels = await ChannelTable.find({
        members: { $all: [user1._id, user2] }
    })
    .populate("admin_id")
    .populate("activity_id")
    .exec()

    const publicFilledActivities: PublicFilledChannel[] = channels
    .map(chann => ChannelToPublicChannel(chann))
    .filter((act): act is PublicFilledChannel => act !== null);


    return publicFilledActivities;
}
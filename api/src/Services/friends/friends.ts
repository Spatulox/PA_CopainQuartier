import { ActivityTable } from "../../DB_Schema/ActivitiesSchema";
import { ChannelTable } from "../../DB_Schema/ChannelSchema";
import { ObjectID } from "../../DB_Schema/connexion";
import { FilledFriend } from "../../Models/FriendsModel";
import { User } from "../../Models/UserModel";
import { getActivityById, toActivityObject } from "../activities/activities";
import { getCommonActivity } from "../activities/common";
import { objectToChannel } from "../channels/channels";
import { getCommonChannels } from "../channels/common";
import { getUserById } from "../users/usersPublic";

export async function getAFriend(user: User, id: ObjectID): Promise<FilledFriend>{
    const targetUser = await getUserById(new ObjectID(id))
    if (!targetUser) throw new Error("Utilisateur non trouvé");

    const commonActivities = await getCommonActivity(user, new ObjectID(targetUser._id))
    const commonChannels = await getCommonChannels(user, id)

    const filledUser: FilledFriend = {
        ...targetUser,
        common_activity: commonActivities ? commonActivities.map(act => toActivityObject(act)) : [],
        common_channels: commonChannels ? commonChannels.map(chan => objectToChannel(chan)) : []
    };

    return filledUser
}
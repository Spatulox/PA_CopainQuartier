import { ObjectID } from "../../DB_Schema/connexion";
import { ActivityTable } from "../../DB_Schema/ActivitiesSchema";
import { Activity, FilledActivity, PublicFilledActivity } from "../../Models/ActivityModel";
import { FilledUser, User } from "../../Models/UserModel";
import { ChannelAuth, ChannelTable } from "../../DB_Schema/ChannelSchema";
import { PublicationTable } from "../../DB_Schema/PublicationSchema";
import { ActivityQueryParam, CreateActivityParam, UpdateActivityParam } from "../../Validators/activities";
import { BadRequestError, ForbiddenError, InternalServerError } from "routing-controllers";
import { objectToPublication } from "../publications/publications";
import { toUserObject } from "../users/usersPublic";
import { objectToChannel } from "../channels/channels";
import { UserRole, UserTable } from "../../DB_Schema/UserSchema";
import { Channel } from "../../Models/ChannelModel";
import { Publication } from "../../Models/PublicationModel";

export async function getActivityById(id: string): Promise<FilledActivity | null> {
    const activity = await ActivityTable.findById(id)
    .populate("publication_id")
    .populate("participants_id")
    .populate("author_id")
    .exec();
    return activity ? toActivityObject(activity) : null;
}


export async function getPublicActivityById(id: ObjectID): Promise<PublicFilledActivity | null> {
    const activity = await ActivityTable.findById(id)
    .populate("publication_id")
    .populate("author_id")
    .exec();
    if (!activity) return null;
    const { channel_chat_id, participants_id, ...publicFields } = activity.toObject();
    return toActivityObject(publicFields)
}

export async function getAllActivities(): Promise<FilledActivity[]> {
    const activities = await ActivityTable.find()
    .sort({ created_at: -1 })
    .populate("publication_id")
    .populate("participants_id")
    .populate("author_id")
    .exec();
    return activities.map(toActivityObject);
}

export async function getMyActivities(user: User, activityFilter?: ActivityQueryParam): Promise<FilledActivity[]> {
    const filter: any = { participants_id: user._id };

    if (activityFilter) {
        Object.assign(filter, activityFilter);
    }

    const activities = await ActivityTable
        .find(filter)
        .sort({ created_at: -1 })
        .populate("publication_id")
        .populate("participants_id")
        .populate("author_id")
        .exec();
    return activities.map(toActivityObject);
}

export async function getMyActivitiesAdmin(user: User): Promise<FilledActivity[]> {
    const activities = await ActivityTable
        .find({ author_id: user._id })
        .sort({ created_at: -1 })
        .populate("publication_id")
        .populate("participants_id")
        .populate("author_id")
        .exec();

    return activities.map(toActivityObject) as FilledActivity[];
}

export async function getAllPublicActivities(): Promise<PublicFilledActivity[]> {
    const activities = await ActivityTable.find().sort({ created_at: -1 })
    .populate("author_id")
    .populate("publication_id")
    .exec()
    return activities.map(activity => {
        const normalized = toActivityObject(activity) as PublicFilledActivity;
        return normalized;
    });
}

export async function createActivity(user: User, activity: CreateActivityParam, image: Express.Multer.File | null = null): Promise<FilledActivity | null> {
    if(await inActivity(user, activity) > 0){
        throw new ForbiddenError("Vous participez déjà à une activité à cette date et heure.");
    }

    if(new Date(activity.date_end) < new Date(activity.date_reservation)){
        throw new BadRequestError("La date de fin doit se situer après la date de début")
    }

    if(new Date(activity.date_reservation) <= new Date()){
        throw new BadRequestError("La date de début ne doit pas se situer dans le passé")
    }

    // Créer le channel chat
    const channel_id = new ObjectID()
    const channelParam: Channel = {
        _id: channel_id,
        activity_id: null,
        troc_id: null,
        name: activity.title + " - Chat",
        type: "text",
        description: "Chat : " + activity.title,
        admin_id: user._id,
        messages: [],
        members: [user._id],
        member_auth: ChannelAuth.read_send,
        created_at: new Date(),
        private: false
    };
    const channel = await ChannelTable.create(channelParam);
    if (!channel || !channel._id) throw new Error("Channel creation failed");

    const activity_id = new ObjectID()
    // Créer la publication
    const publicationParam: Publication = {
        _id: new ObjectID(),
        name: activity.title,
        activity_id: activity_id,
        body: activity.description,
        description: activity.description,
        author_id: user._id,
        created_at: new Date(),
        updated_at: new Date(),
        image_link: image ? image.path : null
    };
    const publication = await PublicationTable.create(publicationParam);
    if (!publication || !publication._id) throw new Error("Publication creation failed");

    // Créer l'activité avec les IDs du channel et de la publication
    const activityToSave: Activity = {
        _id: activity_id,
        title: activity.title,
        description: activity.description,
        date_reservation: new Date(activity.date_reservation),
        date_end: new Date(activity.date_end),
        created_at: new Date(),
        author_id: user._id,
        channel_chat_id: channel_id,
        publication_id: publication._id,
        participants_id: [user._id],
        location: activity.location,
        max_place: activity.max_place,
        reserved_place: 1,
        image_link: image ? image.path : null
    };
    const activityDoc = await ActivityTable.create(activityToSave);
    if (!activityDoc || !activityDoc._id) throw new Error("Activity creation failed");

    await UserTable.updateOne(
        {_id: user._id},
        {$addToSet: {group_chat_list_ids: channel_id}}
    )

    // Mettre à jour la publication avec l'ID de l'activité
    await PublicationTable.updateOne(
        { _id: publication._id },
        { $set: { activity_id: activity_id } }
    );

    const populatedActivity = await ActivityTable.findById(activity_id)
    .populate('author_id')
    .populate('channel_chat_id')
    .populate('publication_id')
    .populate('participants_id');

    const channelUpdate2 = await ChannelTable.updateOne(
        {_id: channel_id},
        { $set: { activity_id: activity_id } }
    )

    return toActivityObject(populatedActivity) as FilledActivity | null;
}


export async function updateActivity(user: User, body: UpdateActivityParam, act_id: ObjectID): Promise<FilledActivity | null> {
    if (!act_id) {
        throw new ForbiddenError("Missing activity ID");
    }


    if(await inActivity(user, body) > 1){
        throw new ForbiddenError("Vous participez déjà à une autre activité à cette date et heure.");
    }

    let doc 
    if(user.role == UserRole.admin){
        doc = await ActivityTable.findOneAndUpdate(
            { _id: act_id },
            {
                title: body.title,
                description: body.description,
                date_reservation: body.date_reservation,
            },
            { new: true }
        )
        .exec();
    } else {
        doc = await ActivityTable.findOneAndUpdate(
            { _id: act_id, author_id: user._id },
            {
                title: body.title,
                description: body.description,
                date_reservation: body.date_reservation,
            },
            { new: true }
        ).exec();
    }
    
    if (!doc) {
        throw new ForbiddenError("You are not allowed to update this activity or it does not exist.");
    }

    doc = await doc.populate([
        { path: 'author_id' },
        { path: 'channel_chat_id' },
        { path: 'publication_id' },
        { path: 'participants_id' }
    ]);

    return toActivityObject(doc) as FilledActivity | null;
}

export async function joinActivityById(user: User, activity: FilledActivity): Promise<boolean> {
    if (activity.participants && activity.participants.some((thuse: any) => thuse._id.toString() == user._id.toString() )) {
        throw new ForbiddenError("L'utilisateur participe déjà à cette activité.");
    }

    if(await inActivity(user, activity) > 0){
        throw new ForbiddenError("Vous participez déjà à une activité à cette date et heure.");
    }

    const activityResult = await ActivityTable.updateOne(
        { _id: activity._id },
        { $addToSet: { participants_id: user._id },
          $inc: {reserved_place: 1}},
        { runValidators: true }
    );

    const channelResult = await ChannelTable.updateOne(
        { _id: activity.channel_chat?._id },
        { $addToSet: { members: user._id } }
    );

    const userResult = await UserTable.updateOne(
        { _id: user._id },
        { $push: { group_chat_list_ids: activity.channel_chat?._id } }
    );

    return activityResult.modifiedCount > 0 && channelResult.modifiedCount > 0 && userResult.modifiedCount > 0;
}

export async function leaveActivityById(user: User, activity: Activity | FilledActivity): Promise<boolean> {

    if("participants_id" in activity && !activity.participants_id.map(id => id.toString()).includes(user._id.toString())){
        throw new ForbiddenError("Vous n'êtes pas inscrit à l'activité")
    } else if("participants" in activity && activity.participants && !activity.participants.some((thuse: any) => thuse._id.toString() == user._id.toString())){
        throw new ForbiddenError("Vous n'êtes pas inscrit à l'activité")
    }

    const activityResult = await ActivityTable.updateOne(
        { _id: activity._id },
        { $pull: { participants_id: user._id },
          $inc: {reserved_place: -1}},
        { runValidators: true }
    );

    // Narrow the type to get the channel ID
    let channelId: ObjectID | string | undefined;
    if ('channel_chat_id' in activity) {
        channelId = activity.channel_chat_id.toString();
    } else if ('channel_chat' in activity && activity.channel_chat) {
        channelId = activity.channel_chat._id;
    }

    if (!channelId) {
        throw new InternalServerError("Something wen wrong when leaving an activity")
    }

    const channelResult = await ChannelTable.updateOne(
        { _id: channelId },
        { $pull: { members: user._id } }
    );

    const userResult = await UserTable.updateOne(
        { _id: user._id },
        { $pull: { group_chat_list_ids: channelId } }
    );

    return activityResult.modifiedCount > 0 && channelResult.modifiedCount > 0 && userResult.modifiedCount > 0;
}

export async function deleteActivity(activity: FilledActivity): Promise<boolean> {
    const activityResult = await ActivityTable.deleteOne(
        { _id: activity._id }
    );

    const channelResult = await ChannelTable.deleteOne(
        { _id: activity.channel_chat?._id }
    );

    const publicationResult = await PublicationTable.deleteOne(
        { _id: activity.publication?._id }
    );

    return (
        activityResult.deletedCount > 0 &&
        channelResult.deletedCount > 0 &&
        publicationResult.deletedCount > 0
    );
}






export function toActivityObject(activityDoc: any): FilledActivity {
    const obj = activityDoc
    return {
        _id: obj._id.toString(),
        title: obj.title,
        description: obj.description,
        created_at: obj.created_at,
        date_reservation: obj.date_reservation,
        date_end: obj.date_end,
        author: obj.author_id ? toUserObject(obj.author_id) : null,
        channel_chat: obj.channel_chat_id ? objectToChannel(obj.channel_chat_id) : null,
        publication: obj.publication_id ? objectToPublication(obj.publication_id): null,
        participants: obj.participants_id ? obj.participants_id.map((user: any) => toUserObject(user)) : null,
        location: obj.location,
        max_place: obj.max_place,
        reserved_place: obj.reserved_place,
        image_link: obj?.image_link || null,
    };
}

export function ActivityToPublicActivity(activity : FilledActivity | null): PublicFilledActivity | null {
    if(activity == null){return null}
    return {
        _id: activity._id.toString(),
        title: activity.title,
        description: activity.description,
        created_at: activity.created_at,
        date_reservation: activity.date_reservation,
        date_end: activity.date_end,
        author: activity.author,
        publication: activity.publication,
        location: activity.location,
        max_place: activity.max_place,
        reserved_place: activity.reserved_place,
        image_link: activity?.image_link || null,
    }
}




async function inActivity(user: User, activity: CreateActivityParam | UpdateActivityParam | FilledActivity): Promise<number>{
    const conflictingActivities = await ActivityTable.find({
        participants_id: user._id,
        date_reservation: { $lt: activity.date_end },
        date_end: { $gt: activity.date_reservation }
    });

    return conflictingActivities.length
}
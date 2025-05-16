import mongoose from "mongoose";
import { ActivityTable } from "../../DB_Schema/ActivitiesSchema";
import { Activity, FilledActivity, PublicActivity, PublicFilledActivity } from "../../Models/ActivityModel";
import { User } from "../../Models/UserModel";
import { ID } from "../../Utils/IDType";
import { ChannelAuth, ChannelTable } from "../../DB_Schema/ChannelSchema";
import { PublicationTable } from "../../DB_Schema/PublicationSchema";
import { CreateActivityParam, UpdateActivityParam } from "../../Validators/activities";
import { ForbiddenError } from "routing-controllers";
import { objectToPublication } from "../publications/publications";
import { toUserObject } from "../users/usersPublic";
import { objectToChannel } from "../channels/channels";
import { UserRole, UserTable } from "../../DB_Schema/UserSchema";

export async function getActivityById(id: string): Promise<FilledActivity | null> {
    const activity = await ActivityTable.findById(id)
    .populate("publication_id")
    .populate("participants_id")
    .populate("author_id")
    .exec();
    return activity ? toActivityObject(activity) : null;
}


export async function getPublicActivityById(id: ID): Promise<PublicFilledActivity | null> {
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

export async function getMyActivities(user: User): Promise<FilledActivity[]> {
    const activities = await ActivityTable
        .find({ participants_id: user._id })
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

// Mongo transaction are pain in the ass to sutup
/*
export async function createActivity(user: User, activity: CreateActivityParam): Promise<Activity | null> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // channel chat
        const channelParam = {
            name: activity.title + " - Chat",
            type: "text",
            description: "Chat : " + activity.title
        };
        const channel = await ChannelTable.create([{ 
            ...channelParam, 
            publication_id: null,
            admin_id: user._id,
            messages: [],
            members: [user._id],
            member_auth: ChannelAuth.read_send,
            created_at: new Date()
        }], { session });
        if (!channel || !channel[0]) throw new Error("Channel creation failed");

        // publication
        const publicationParam = {
            name: activity.title,
            activity_id: null, // temporaire
            body: activity.description
        };
        const publication = await PublicationTable.create([{
            ...publicationParam,
            author_id: user._id,
            created_at: new Date(),
            updated_at: new Date()
        }], { session });
        if (!publication || !publication[0]) throw new Error("Publication creation failed");

        //Create Activity With IDs channel et publication
        const activityToSave = {
            title: activity.title,
            description: activity.description,
            date_reservation: activity.date_reservation,
            created_at: new Date(),
            author_id: user._id,
            channel_chat_id: channel[0]._id,
            publication_id: publication[0]._id,
            participants_id: [user._id]
        };
        const activityDoc = await ActivityTable.create([activityToSave], { session });
        if (!activityDoc || !activityDoc[0]) throw new Error("Activity creation failed");

        //Update pub ID with activity ID
        await PublicationTable.updateOne(
            { _id: publication[0]._id },
            { $set: { activity_id: activityDoc[0]._id } },
            { session }
        );

        await session.commitTransaction();
        return activityDoc[0];
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }
}
*/
export async function createActivity(user: User, activity: CreateActivityParam): Promise<FilledActivity | null> {
    // Créer le channel chat
    const channelParam = {
        name: activity.title + " - Chat",
        type: "text",
        description: "Chat : " + activity.title,
        publication_id: null,
        admin_id: user._id,
        messages: [],
        members: [user._id],
        member_auth: ChannelAuth.read_send,
        created_at: new Date()
    };
    const channel = await ChannelTable.create(channelParam);
    if (!channel || !channel._id) throw new Error("Channel creation failed");

    // Créer la publication
    const publicationParam = {
        name: activity.title,
        activity_id: null, // temporaire
        body: activity.description,
        author_id: user._id,
        created_at: new Date(),
        updated_at: new Date()
    };
    const publication = await PublicationTable.create(publicationParam);
    if (!publication || !publication._id) throw new Error("Publication creation failed");

    // Créer l'activité avec les IDs du channel et de la publication
    const activityToSave = {
        title: activity.title,
        description: activity.description,
        date_reservation: activity.date_reservation,
        created_at: new Date(),
        author_id: user._id,
        channel_chat_id: channel._id,
        publication_id: publication._id,
        participants_id: [user._id]
    };
    const activityDoc = await ActivityTable.create(activityToSave);
    if (!activityDoc || !activityDoc._id) throw new Error("Activity creation failed");

    await UserTable.updateOne(
        {_id: user._id},
        {$addToSet: {group_chat_list_ids: channel._id}}
    )

    // Mettre à jour la publication avec l'ID de l'activité
    await PublicationTable.updateOne(
        { _id: publication._id },
        { $set: { activity_id: activityDoc._id } }
    );

    const populatedActivity = await ActivityTable.findById(activityDoc._id)
    .populate('author_id')
    .populate('channel_chat_id')
    .populate('publication_id')
    .populate('participants_id');

    return toActivityObject(populatedActivity) as FilledActivity | null;
}


export async function updateActivity(user: User, body: UpdateActivityParam, act_id: ID): Promise<FilledActivity | null> {
    if (!act_id) {
        throw new ForbiddenError("Missing activity ID");
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

// Mongo DB + transaction are pain in the ass to setup
/*
export async function joinActivityById(user: User, activity: Activity): Promise<boolean> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const activityResult = await ActivityTable.updateOne(
            { _id: activity._id },
            { $addToSet: { participants_id: user._id } },
            { session }
        );

        const channelResult = await ChannelTable.updateOne(
            { _id: activity.channel_chat_id },
            { $addToSet: { members: user._id } },
            { session }
        );

        if (activityResult.modifiedCount > 0 && channelResult.modifiedCount > 0) {
            await session.commitTransaction();
            return true;
        } else {
            await session.abortTransaction();
            return false;
        }
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }
}


export async function leaveActivityById(user: User, activity: Activity): Promise<boolean> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const activityResult = await ActivityTable.updateOne(
            { _id: activity._id },
            { $pull: { participants_id: user._id } },
            { session }
        );

        const channelResult = await ChannelTable.updateOne(
            { _id: activity.channel_chat_id },
            { $pull: { members: user._id } },
            { session }
        );

        if (activityResult.modifiedCount > 0 && channelResult.modifiedCount > 0) {
            await session.commitTransaction();
            return true;
        } else {
            await session.abortTransaction();
            return false;
        }
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }
}

export async function deleteActivity(activity: Activity): Promise<boolean> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const activityResult = await ActivityTable.deleteOne(
            { _id: activity._id },
            { session }
        );

        const channelResult = await ChannelTable.deleteOne(
            { _id: activity.channel_chat_id },
            { session }
        );

        const publicationResult = await PublicationTable.deleteOne(
            { _id: activity.publication_id },
            { session }
        );

        if (
            activityResult.deletedCount > 0 &&
            channelResult.deletedCount > 0 &&
            publicationResult.deletedCount > 0
        ) {
            await session.commitTransaction();
            return true;
        } else {
            await session.abortTransaction();
            return false;
        }
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }
}
*/

export async function joinActivityById(user: User, activity: FilledActivity): Promise<boolean> {
    const activityResult = await ActivityTable.updateOne(
        { _id: activity._id },
        { $addToSet: { participants_id: user._id } }
    );

    const channelResult = await ChannelTable.updateOne(
        { _id: activity.channel_chat_id },
        { $addToSet: { members: user._id } }
    );

    return activityResult.modifiedCount > 0 && channelResult.modifiedCount > 0;
}

export async function leaveActivityById(user: User, activity: Activity | FilledActivity): Promise<boolean> {
    const activityResult = await ActivityTable.updateOne(
        { _id: activity._id },
        { $pull: { participants_id: user._id } }
    );

    const channelResult = await ChannelTable.updateOne(
        { _id: activity.channel_chat_id },
        { $pull: { members: user._id } }
    );

    return activityResult.modifiedCount > 0 && channelResult.modifiedCount > 0;
}

export async function deleteActivity(activity: FilledActivity): Promise<boolean> {
    const activityResult = await ActivityTable.deleteOne(
        { _id: activity._id }
    );

    const channelResult = await ChannelTable.deleteOne(
        { _id: activity.channel_chat_id }
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
        _id: obj._id,
        title: obj.title,
        description: obj.description,
        created_at: obj.created_at,
        date_reservation: obj.date_reservation,
        author: obj.author_id ? toUserObject(obj.author_id) : null,
        channel_chat_id: obj.channel_chat_id ? objectToChannel(obj.channel_chat_id) : null,
        publication: obj.publication_id ? objectToPublication(obj.publication_id): null,
        participants: obj.participants_id ? obj.participants_id.map((user: any) => toUserObject(user)) : null,
    };
}

export function ActivityToPublicActivity(activity : FilledActivity | null): PublicFilledActivity | null {
    if(activity == null){return null}
    return {
        _id: activity._id,
        title: activity.title,
        description: activity.description,
        created_at: activity.created_at,
        date_reservation: activity.date_reservation,
        author: activity.author,
        publication: activity.publication
    }
}
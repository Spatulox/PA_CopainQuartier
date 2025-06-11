import { ForbiddenError, InternalServerError } from "routing-controllers";
import { TrocTable } from "../../DB_Schema/TrocSchema";
import { FilledTroc, Troc, TrocStatus, TrocType, TrocVisibility } from "../../Models/TrocModel";
import { User } from "../../Models/UserModel";
import { CreateTrocBody, UpdateTrocBody } from "../../Validators/trocs";
import { toUserObject } from "../users/usersPublic";
import { ObjectId } from "mongodb";
import { ObjectID } from "../../DB_Schema/connexion";
import { Channel } from "../../Models/ChannelModel";
import { createChannel, objectToChannel } from "../channels/channels";
import { UserTable } from "../../DB_Schema/UserSchema";

export function toTrocObject(doc: any): FilledTroc {
    return {
        _id: doc._id.toString(),
        title: doc.title,
        created_at: doc.created_at,
        author: doc.author_id ? toUserObject(doc.author_id) : null,
        description : doc.description,
        reserved_at: doc.reserved_at || null,
        reserved_by: doc.reserved_by ? doc.reserved_by.map((user: User) => (toUserObject(user))) : [],
        updated_at: doc.updated_at,
        status: doc.status,
        type: doc.type,
        visibility: doc.visibility,
        channel: doc.channel_id ? objectToChannel(doc.channel_id) : null,
    };
}

// GET : Trocs visibles (pas completed, pas reserved, pas waiting, pas hide) // Seulement pending (en attente d'un mec qui veut l'objet/le troc)
export async function getAllTrocs(): Promise<FilledTroc[]> {
    const docs = await TrocTable.find({
        status: { $nin: [TrocStatus.completed, TrocStatus.cancelled, TrocStatus.waitingForApproval, TrocStatus.reserved, TrocStatus.hide] }, // TrocStatus.hide is non approve troc by admin
        visibility: { $ne: TrocVisibility.hide }
    }).sort({ created_at: -1 })
    .populate("author_id")
    .exec();
    return docs.map(toTrocObject);
}

export async function getAllMyTrocs(user: User): Promise<FilledTroc[]> {
    const docs = await TrocTable.find({author_id: user._id}).sort({ created_at: -1 })
    .populate("author_id")
    .populate("reserved_by")
    .exec();
    return docs.map(toTrocObject);
}

export async function getAllMyTrocsApplied(user: User): Promise<FilledTroc[]> {
    const docs = await TrocTable.find({
        reserved_by: { $in: [user._id] }
    })
    .populate("author_id")
    .populate("reserved_by")
    .exec()
    return docs.map(toTrocObject);
}

// GET : Un troc par son ID
export async function getTrocById(id: ObjectId): Promise<FilledTroc | null> {
    const doc = await TrocTable.findById(id)
    .populate("reserved_by")
    .populate("author_id")
    .populate("channel_id")
    .exec();
    return doc ? toTrocObject(doc) : null;
}

// POST : Création (toujours waitingForApproval)
export async function createTroc(trocBody: CreateTrocBody, user: User): Promise<FilledTroc> {
    const troc_id = new ObjectID()

    const channel = await createChannel(user, {name: trocBody.title, description: trocBody.description})
    if(!channel){
        throw new InternalServerError("Impossible to create a channel linked to a Troc")
    }

    const data: Troc = {
        _id: troc_id,
        ...trocBody,
        author_id: user._id,
        description : trocBody.description,
        status: TrocStatus.waitingForApproval,
        created_at: new Date(),
        updated_at: new Date(),
        visibility: TrocVisibility.visible,
        channel_id: new ObjectID(channel?._id),
    }
    const troc = new TrocTable(data);
    await troc.save();

    const userDoc = await UserTable.updateOne(
        {_id: user._id},
        {$addToSet: {group_chat_list_ids: channel?._id}},
        {new: true}
    )
    if(userDoc.modifiedCount <= 0 && userDoc.matchedCount <= 0){
        throw new InternalServerError("Impossible to link the chat (linked to the troc) to a user")
    }
    return toTrocObject(troc);
}

// PATCH : Update par l'auteur
export async function updateTroc(id: ObjectId, authorId: ObjectId, data: UpdateTrocBody): Promise<FilledTroc | null> {
    const doc = await TrocTable.findOneAndUpdate(
        { _id: id, author_id: authorId },
        data,
        { new: true }
    ).exec();
    return doc ? toTrocObject(doc) : null;
}

// DELETE : Impossible si completed, admin ou auteur uniquement
export async function deleteTroc(id: ObjectId, userId: ObjectId, isAdmin: boolean): Promise<boolean> {
    const troc = await TrocTable.findById(id).exec();
    if (!troc || troc.status === TrocStatus.completed) {
        throw new ForbiddenError("Can't delete a completed troc");
    }
    if (isAdmin || troc.author_id.toString() === userId.toString()) {
        const res = await TrocTable.deleteOne({ _id: id }).exec();
        return res.deletedCount === 1;
    }
    throw new ForbiddenError("Not authorized to delete this troc");
}

// PATCH : Réserver (impossible si waitingForApproval / hide / reserved)
export async function reserveTroc(id: ObjectId, userId: ObjectId): Promise<FilledTroc | null> {
    const troc = await TrocTable.findById(id).exec();
    if (!troc) return null;
    if (troc.status === TrocStatus.waitingForApproval || troc.visibility === TrocVisibility.hide || troc.status === TrocStatus.hide) {
        throw new ForbiddenError("Cannot reserve a troc that is waiting for approval or hidden");
    }

    if (troc.type === TrocType.serviceMorethanOnePerson) {
        const doc = await TrocTable.findOneAndUpdate(
            { _id: id },
            {
                reserved_at: new Date(),
                $addToSet: { reserved_by: userId }
            },
            { new: true }
        ).exec();
        return doc ? toTrocObject(doc) : null;
    } else {
        // Pour item/service : vérifier qu'il n'est pas déjà réservé
        if (troc.status !== TrocStatus.pending || (Array.isArray(troc.reserved_by) && troc.reserved_by.length > 0)) {
            throw new ForbiddenError("This troc is already reserved");
        }
        const doc = await TrocTable.findOneAndUpdate(
            { _id: id, status: TrocStatus.pending, $or: [{ reserved_by: { $exists: false } }, { reserved_by: { $size: 0 } }] },
            {
                reserved_at: new Date(),
                reserved_by: [userId],
                status: TrocStatus.reserved
            },
            { new: true }
        ).exec();
        return doc ? toTrocObject(doc) : null;
    }
}

// PATCH : Marquer comme complété (impossible si waitingForApproval ou hide)
export async function completeTroc(id: ObjectId, authorId: ObjectId): Promise<FilledTroc | null> {
    const troc = await TrocTable.findById(id).exec();
    if (!troc) return null;
    if (
        troc.status === TrocStatus.waitingForApproval ||
        troc.visibility === TrocVisibility.hide
    ) {
        throw new ForbiddenError("Cannot complete a troc that is waiting for approval or hidden");
    }
    const doc = await TrocTable.findOneAndUpdate(
        { _id: id, author_id: authorId },
        { status: TrocStatus.completed },
        { new: true }
    ).exec();
    return doc ? toTrocObject(doc) : null;
}

// PATCH : Annuler (impossible si completed, waitingForApproval ou hide)
export async function cancelTroc(id: ObjectId, userId: ObjectId): Promise<FilledTroc | null> {
    const troc = await TrocTable.findById(id).exec();
    if (!troc || troc.status === TrocStatus.completed ||
        troc.status === TrocStatus.waitingForApproval ||
        troc.visibility === TrocVisibility.hide
    ) {
        throw new ForbiddenError("Cannot cancel this troc");
    }
    const doc = await TrocTable.findOneAndUpdate(
        {
            _id: id,
            $or: [{ author_id: userId }, { reserved_by: userId }]
        },
        { status: TrocStatus.pending,
          reserved_by: [],
          reserved_at: null
        },
        { new: true }
    ).exec();
    return doc ? toTrocObject(doc) : null;
}

// PATCH
export async function leaveTroc(id: ObjectId, userId: ObjectId): Promise<FilledTroc | null> {
    const troc = await TrocTable.findById(id).exec();
    if (!troc || troc.type !== TrocType.serviceMorethanOnePerson) {
        throw new ForbiddenError("Cannot leave this troc");
    }
    if(troc.status === TrocStatus.waitingForApproval || troc.visibility === TrocVisibility.hide){
        throw new ForbiddenError("Cannot leave this troc");
    }

    const doc = await TrocTable.findOneAndUpdate(
        {
            _id: id,
        },
        {
            $pull: { reserved_by: userId }
        },
        { new: true }
    ).exec();
    return doc ? toTrocObject(doc) : null;
}

// PATCH : Cacher un troc (par l'auteur)
export async function hideTroc(id: ObjectId, authorId: ObjectId): Promise<FilledTroc | null> {
    const doc = await TrocTable.findOneAndUpdate(
        { _id: id, author_id: authorId },
        { visibility: TrocVisibility.hide },
        { new: true }
    ).exec();
    return doc ? toTrocObject(doc) : null;
}
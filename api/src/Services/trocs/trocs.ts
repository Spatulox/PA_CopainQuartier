import { ForbiddenError, UnauthorizedError } from "routing-controllers";
import { TrocTable } from "../../DB_Schema/TrocSchema";
import { Troc, TrocStatus, TrocType, TrocVisibility } from "../../Models/TrocModel";
import { User } from "../../Models/UserModel";
import { ID } from "../../Utils/IDType";
import { CreateTrocBody, UpdateTrocBody } from "../../Validators/trocs";
import { UserRole } from "../../DB_Schema/UserSchema";
import { toUserObject } from "../users/usersPublic";

export function toTrocObject(doc: any): any {
    return {
        _id: doc._id.toString(),
        title: doc.title,
        created_at: doc.created_at,
        author: doc.author_id ? toUserObject(doc.author_id) : null,
        description : doc.description,
        reserved_at: doc.reserved_at || null,
        reserved_by: doc.reserved_by ? doc.reserved_by.toString() : null,
        status: doc.status,
        type: doc.type,
        visibility: doc.visibility
    };
}

// GET : Trocs visibles (pas completed, pas reserved, pas waiting, pas hide) // Seulement pending (en attente d'un mec qui veut l'objet/le troc)
export async function getAllTrocs(): Promise<Troc[]> {
    const docs = await TrocTable.find({
        status: { $nin: [TrocStatus.completed, TrocStatus.cancelled, TrocStatus.waitingForApproval, TrocStatus.reserved] },
        visibility: { $ne: TrocVisibility.hide }
    }).sort({ created_at: -1 })
    .populate("author_id")
    .exec();
    return docs.map(toTrocObject);
}

// GET : Un troc par son ID
export async function getTrocById(id: string): Promise<Troc | null> {
    const doc = await TrocTable.findById(id).exec();
    return doc ? toTrocObject(doc) : null;
}

// POST : Création (toujours waitingForApproval)
export async function createTroc(trocBody: CreateTrocBody, user: User): Promise<Troc> {
    const data = {
        ...trocBody,
        author_id: user._id,
        description : trocBody.description,
        status: TrocStatus.waitingForApproval,
        created_at: new Date(),
        visibility: TrocVisibility.visible
    }
    const troc = new TrocTable(data);
    await troc.save();
    return toTrocObject(troc);
}

// PUT : Update par l'auteur
export async function updateTroc(id: ID, authorId: ID, data: UpdateTrocBody): Promise<Troc | null> {
    const doc = await TrocTable.findOneAndUpdate(
        { _id: id, author_id: authorId },
        data,
        { new: true }
    ).exec();
    return doc ? toTrocObject(doc) : null;
}

// DELETE : Impossible si completed, admin ou auteur uniquement
export async function deleteTroc(id: string, userId: string, isAdmin: boolean): Promise<boolean> {
    const troc = await TrocTable.findById(id).exec();
    if (!troc || troc.status === TrocStatus.completed) {
        throw new ForbiddenError("Can't delete a completed troc");
    }
    if (isAdmin || troc.author_id.toString() === userId) {
        const res = await TrocTable.deleteOne({ _id: id }).exec();
        return res.deletedCount === 1;
    }
    throw new ForbiddenError("Not authorized to delete this troc");
}

// PATCH : Réserver (impossible si waitingForApproval / hide / reserved)
export async function reserveTroc(id: string, userId: string): Promise<Troc | null> {
    const troc = await TrocTable.findById(id).exec();
    if (!troc) return null;
    if (
        troc.status === TrocStatus.waitingForApproval ||
        troc.visibility === TrocVisibility.hide
    ) {
        throw new ForbiddenError("Cannot reserve a troc that is waiting for approval or hidden");
    }

    if (troc.type === TrocType.serviceMorethanOnePerson) {
        // Ajoute l'utilisateur au tableau reserved_by
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
        if (
            troc.status !== TrocStatus.pending ||
            (Array.isArray(troc.reserved_by) && troc.reserved_by.length > 0)
        ) {
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
export async function completeTroc(id: string, authorId: string): Promise<Troc | null> {
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
export async function cancelTroc(id: string, userId: string): Promise<Troc | null> {
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
        { status: TrocStatus.pending },
        { new: true }
    ).exec();
    return doc ? toTrocObject(doc) : null;
}

// PATCH : Cacher un troc (par l'auteur)
export async function hideTroc(id: string, authorId: string): Promise<Troc | null> {
    const doc = await TrocTable.findOneAndUpdate(
        { _id: id, author_id: authorId },
        { visibility: TrocVisibility.hide },
        { new: true }
    ).exec();
    return doc ? toTrocObject(doc) : null;
}
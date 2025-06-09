import { ForbiddenError, UnauthorizedError } from "routing-controllers";
import { TrocTable } from "../../DB_Schema/TrocSchema";
import { FilledTroc, Troc, TrocStatus, TrocVisibility } from "../../Models/TrocModel";
import { User } from "../../Models/UserModel";
import { UserRole } from "../../DB_Schema/UserSchema";
import { toTrocObject } from "./trocs";
import { ObjectID } from "../../DB_Schema/connexion";

// Formate un document Mongo en Troc plat
export function toTrocObjectAdmin(doc: any): Troc {
    return {
        _id: doc._id.toString(),
        title: doc.title,
        created_at: doc.created_at,
        description: doc.description,
        author_id: doc.author_id.toString(),
        reserved_at: doc.reserved_at || null,
        reserved_by: Array.isArray(doc.reserved_by)
            ? doc.reserved_by.map((id: any) => id.toString())
            : [],
        updated_at: doc.updated_at,
        status: doc.status,
        type: doc.type,
        visibility: doc.visibility
    };
}

export async function getAllAdminTrocs(): Promise<FilledTroc[]> {
    const docs = await TrocTable.find().sort({ created_at: -1 })
    .populate("author_id")
    .populate("reserved_by")
    .exec();
    return docs.map(toTrocObject);
}

export async function getAdminTrocById(id: ObjectID): Promise<FilledTroc | null> {
    const doc = await TrocTable.findById(id)
    .populate("author_id")
    .populate("reserved_by")
    .exec();
    return doc ? toTrocObject(doc) : null;
}

export async function getWaitingTrocs(): Promise<FilledTroc[]> {
    const docs = await TrocTable.find({
        status: TrocStatus.waitingForApproval,
        visibility: { $ne: TrocVisibility.hide }
    }).sort({ created_at: -1 })
    .populate("author_id")
    .populate("reserved_by")
    .exec();
    return docs.map(toTrocObject);
}

export async function updateWaitingTrocStatus(id: string, status: TrocStatus.pending | TrocStatus.cancelled | TrocStatus.hide, admin: User): Promise<boolean | null> {
    if (admin.role !== UserRole.admin) {
        throw new UnauthorizedError("Only admins can validate trocs");
    }
    if (![TrocStatus.pending, TrocStatus.cancelled, TrocStatus.hide].includes(status)) {
        throw new ForbiddenError("Invalid status for approval");
    }
    const doc = await TrocTable.findOneAndUpdate(
        { _id: id, status: TrocStatus.waitingForApproval },
        { status },
        { new: true }
    ).exec();
    return doc ? true : false;
}

import { ForbiddenError, UnauthorizedError } from "routing-controllers";
import { TrocTable } from "../../DB_Schema/TrocSchema";
import { Troc, TrocStatus, TrocVisibility } from "../../Models/TrocModel";
import { User } from "../../Models/UserModel";
import { UserRole } from "../../DB_Schema/UserSchema";

// Formate un document Mongo en Troc plat
export function toTrocObject(doc: any): Troc {
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
        status: doc.status,
        type: doc.type,
        visibility: doc.visibility
    };
}

export async function getWaitingTrocs(): Promise<Troc[]> {
    const docs = await TrocTable.find({
        status: TrocStatus.waitingForApproval,
        visibility: { $ne: TrocVisibility.hide }
    }).sort({ created_at: -1 }).exec();
    return docs.map(toTrocObject);
}

export async function updateWaitingTrocStatus(id: string, status: TrocStatus.pending | TrocStatus.cancelled, admin: User): Promise<Troc | null> {
    if (admin.role !== UserRole.admin) {
        throw new UnauthorizedError("Only admins can validate trocs");
    }
    if (![TrocStatus.pending, TrocStatus.cancelled].includes(status)) {
        throw new ForbiddenError("Invalid status for approval");
    }
    const doc = await TrocTable.findOneAndUpdate(
        { _id: id, status: TrocStatus.waitingForApproval },
        { status },
        { new: true }
    ).exec();
    return doc ? toTrocObject(doc) : null;
}

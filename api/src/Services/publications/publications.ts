import mongoose from "mongoose";
import { PublicationTable } from "../../DB_Schema/PublicationSchema";
import { UserRole } from "../../DB_Schema/UserSchema";
import { Publication } from "../../Models/PublicationModel";
import { User } from "../../Models/UserModel";
import { ID } from "../../Utils/IDType";
import { CreatePublicationParam, UpdatePublicationParam } from "../../Validators/publications";
import { getActivityById, toActivityObject } from "../activities/activities";
import { toUserObject } from "../users/usersPublic";

export async function getAllPublications(): Promise<Publication[]> {
    const res = await PublicationTable.find().sort({ created_at: -1 })
    .populate("author_id")
    .exec();
    const finaleRes: Publication[] = []
    res.forEach(re => {
        finaleRes.push(objectToPublication(re))
    })
    return finaleRes
}

export async function getAllMyPublications(user: User): Promise<Publication[]> {
    const res = await PublicationTable.find(
        { author_id: user._id }
    ).sort({ created_at: -1 })
    .populate("author_id")
    .populate("activity_id")
    .exec();

    return res.map(objectToPublication);
}

export async function getPublicationById(pub_id: ID): Promise<Publication | null>{
    const res = await PublicationTable.findById(pub_id)
    return objectToPublication(res)
}

export async function createPublication(user: User, content: CreatePublicationParam): Promise<boolean> {
    let acti: string | undefined = ""
    if(content.activity_id){
        const activity = await getActivityById(content.activity_id)
        acti = activity?._id
    }

    const dataToSave = {
        name: content.name,
        author_id: user._id,
        activity_id: acti ? new mongoose.Types.ObjectId(acti) : undefined,
        body: content.body,
        created_at: new Date(),
        updated_at: new Date()
    };
    const result = await PublicationTable.create(dataToSave);
    return !!result;
}

export async function updatePublicationcontent(user: User, pub_id: ID, content: UpdatePublicationParam): Promise<boolean> {
    
    const updateFields: any = {};
    if (content.name !== undefined) updateFields.name = content.name;
    if (content.activity_id !== undefined) updateFields.activity_id = new mongoose.Types.ObjectId(content.activity_id);
    if (content.body !== undefined) updateFields.body = content.body;
    updateFields.updated_at = new Date();

    const result = await PublicationTable.updateOne(
        { _id: pub_id, author_id: user._id },
        { $set: updateFields }
    ).exec();

    return result.modifiedCount > 0;
}

export async function deletePublicationById(user: User, pub_id: ID): Promise<boolean> {
    let condition: any = { _id: pub_id };

    if (user.role !== UserRole.admin) {
        condition.author_id = user._id;
    }

    const result = await PublicationTable.deleteOne(condition).exec();
    return result.deletedCount > 0;
}


export function objectToPublication(obj: any): Publication {
    return {
        _id: obj._id?.toString(),
        name: obj.name,
        created_at: obj.created_at ? new Date(obj.created_at) : new Date(),
        updated_at: obj.updated_at ? new Date(obj.updated_at) : new Date(),
        author_id: obj.author_id ? toUserObject(obj.author_id) : obj.author_id.toString(),
        activity_id: obj.activity_id ? toActivityObject(obj) : undefined,
        body: obj.body,
    };
}

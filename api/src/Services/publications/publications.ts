import mongoose from "mongoose";
import { PublicationTable } from "../../DB_Schema/PublicationSchema";
import { UserRole } from "../../DB_Schema/UserSchema";
import { Publication } from "../../Models/PublicationModel";
import { User } from "../../Models/UserModel";
import { ID } from "../../Utils/IDType";
import { CreatePublicationParam, UpdatePublicationParam } from "../../Validators/publications";

export async function getAllPublications(): Promise<Publication[]> {
    return await PublicationTable.find().sort({ created_at: -1 }).exec();
}

export async function getPublicationById(pub_id: ID): Promise<Publication | null>{
    return await PublicationTable.findById(pub_id)
}

export async function createPublication(user: User, content: CreatePublicationParam): Promise<boolean> {
    const dataToSave = {
        name: content.name,
        author_id: user._id,
        activity_id: content.activity_id ? new mongoose.Types.ObjectId(content.activity_id) : undefined,
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

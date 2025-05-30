import mongoose, { ObjectId } from "mongoose";
import { PublicationTable } from "../../DB_Schema/PublicationSchema";
import { UserRole } from "../../DB_Schema/UserSchema";
import { FilledPublication, Publication } from "../../Models/PublicationModel";
import { User } from "../../Models/UserModel";
import { CreatePublicationParam, UpdatePublicationParam } from "../../Validators/publications";
import { getActivityById, toActivityObject } from "../activities/activities";
import { toUserObject } from "../users/usersPublic";
import { ObjectID } from "../../DB_Schema/connexion";

export async function getAllPublications(): Promise<FilledPublication[]> {
    const res = await PublicationTable.find().sort({ created_at: -1 })
    .populate("activity_id")
    .exec();
    const finaleRes: FilledPublication[] = []
    res.forEach(re => {
        finaleRes.push(objectToPublication(re))
    })
    return finaleRes
}

export async function getAllMyPublications(user: User): Promise<FilledPublication[]> {
    const res = await PublicationTable.find(
        { author_id: user._id }
    ).sort({ created_at: -1 })
    .populate("author_id")
    .populate("activity_id")
    .exec();

    return res.map(objectToPublication);
}

export async function getAllAdminPublications(): Promise<FilledPublication[]> {
    const res = await PublicationTable.find().sort({ created_at: -1 })
    .populate("author_id")
    .populate("activity_id")
    .exec();
    const finaleRes: FilledPublication[] = []
    res.forEach(re => {
        finaleRes.push(objectToPublication(re))
    })
    return finaleRes
}

export async function getPublicationById(pub_id: ObjectID): Promise<FilledPublication | null>{
    const res = await PublicationTable.findById(pub_id)
    .exec()
    if (!res) return null
    return objectToPublication(res)
}

export async function getAllPublicationsByActivityId(activity_id: ObjectID): Promise<FilledPublication[] | null> {
  try {
    const publications = await PublicationTable.find({ activity_id }).sort({ created_at: -1 })
      .populate('author_id', 'name')
      .populate('activity_id', 'title')
      .exec();

    if (!publications || publications.length === 0) {
      return [];
    }
    if(publications){
        return publications.map((pub) => objectToPublication(pub))
    } else {
        return null
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des publications :', error);
    return null;
  }
}

export async function getAdminPublicationById(pub_id: ObjectID): Promise<FilledPublication | null>{
    const res = await PublicationTable.findById(pub_id)
    .populate("author_id")
    .populate("activity_id")
    .exec()
    if (!res) return null
    return objectToPublication(res)
}

export async function createPublication(user: User, content: CreatePublicationParam): Promise<boolean> {
    let acti: string | undefined
    if(content.activity_id){
        const activity = await getActivityById(content.activity_id)
        acti = activity?._id.toString()
    }

    const dataToSave = {
        name: content.name,
        author_id: user._id,
        activity_id: acti ? acti : undefined,
        body: content.body,
        created_at: new Date(),
        updated_at: new Date(),
    };
    const result = await PublicationTable.create(dataToSave);
    return !!result;
}

export async function updatePublicationcontent(user: User, pub_id: ObjectID, content: UpdatePublicationParam): Promise<boolean> {
    
    const updateFields: any = {};
    if (content.name !== undefined) updateFields.name = content.name;
    if (content.activity_id !== undefined) updateFields.activity_id = new ObjectID(content.activity_id);
    if (content.body !== undefined) updateFields.body = content.body;
    updateFields.updated_at = new Date();

    const result = await PublicationTable.updateOne(
        { _id: pub_id, author_id: user._id },
        { $set: updateFields }
    ).exec();
    return result.modifiedCount > 0;
}

export async function deletePublicationById(user: User, pub_id: ObjectID): Promise<boolean> {
    let condition: any = { _id: pub_id };

    if (user.role !== UserRole.admin) {
        condition.author_id = user._id;
    }

    const result = await PublicationTable.deleteOne(condition).exec();
    return result.deletedCount > 0;
}


export function objectToPublication(obj: any): FilledPublication { // Any because author_id is an USer Object, but in Publication type it's an ObjectID (and sometime it can be one)
    return {
        _id: obj._id?.toString(),
        name: obj.name,
        created_at: obj.created_at ? new Date(obj.created_at) : new Date(),
        updated_at: obj.updated_at ? new Date(obj.updated_at) : new Date(),
        author: obj.author_id ? toUserObject(obj.author_id) : null,
        activity: obj.activity_id ? toActivityObject(obj.activity_id) : undefined,
        body: obj.body,
    };
}

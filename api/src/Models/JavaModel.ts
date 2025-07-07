import { ObjectID } from "../DB_Schema/connexion";

export type JavaModel = {
  _id: ObjectID;
  version: string;
  createdAt: Date;
};

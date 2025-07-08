import { ObjectID } from "../DB_Schema/connexion";

export type JavaModel = {
  _id: ObjectID;
  version: string;
  filename: string,
  createdAt: Date;
};

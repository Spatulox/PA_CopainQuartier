import { ObjectID } from "../DB_Schema/connexion";

export type JavaModel = {
  _id: string;
  version: ObjectID;
  executable_path: string;
  createdAt: Date;
};

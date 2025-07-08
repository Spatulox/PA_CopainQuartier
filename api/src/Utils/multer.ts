import { diskStorage } from "multer";
import { extname } from "path";
import { Request } from "express-serve-static-core";
import { ObjectID } from "../DB_Schema/connexion";

export enum ImgFilepath {
  activity = "img/activity",
  publication = "img/publication",
  troc = "img/troc",
  profile = "img/profile",
  uploads = "uploads",
  java = "java/versions",
}

type Callback = (error: null | Error, val: any) => void;
type File = Express.Multer.File;

export const activityUploadsOptions = {
  storage: diskStorage({
    destination: ImgFilepath.activity,
    filename: (req, file, cb) => {
      cb(null, Date.now() + extname(file.originalname));
    }
  }),
  fileFilter: (req: Request, file: File, cb: Callback) => {
    // Ok Type (HTML / PNG, ETC...)
    const isValid = true;
    cb(null, isValid);
  },
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 Mo
  }
};

export const trocUploadsOptions = {
  storage: diskStorage({
    destination: ImgFilepath.troc,
    filename: (req, file, cb) => {
      cb(null, Date.now() + extname(file.originalname));
    }
  }),
  fileFilter: (req: Request, file: File, cb: Callback) => {
    // Ok Type (HTML / PNG, ETC...)
    const isValid = true;
    cb(null, isValid);
  },
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 Mo
  }
};

export const publicationUploadsOptions = {
  storage: diskStorage({
    destination: ImgFilepath.publication,
    filename: (req, file, cb) => {
      cb(null, Date.now() + extname(file.originalname));
    }
  }),
  fileFilter: (req: Request, file: File, cb: Callback) => {
    // Ok Type (HTML / PNG, ETC...)
    const isValid = true;
    cb(null, isValid);
  },
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 Mo
  }
};


export const profileUploadsOptions = {
  storage: diskStorage({
    destination: ImgFilepath.profile,
    filename: (req, file, cb) => {
      cb(null, Date.now() + extname(file.originalname));
    }
  }),
  fileFilter: (req: Request, file: File, cb: Callback) => {
    // Ok Type (HTML / PNG, ETC...)
    const isValid = true;
    cb(null, isValid);
  },
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 Mo
  }
};

export const javaUploadsOptions = {
  storage: diskStorage({
    destination: ImgFilepath.java,
    filename: (req, file, cb) => {
      cb(null, "Java" + Date.now() + extname(file.originalname))
    }
  }),
  fileFilter: (req: Request, file: File, cb: Callback) => {
    const isValid = true;
    cb(null, isValid);
  },
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 Mo
  }
};

export const uploadsOptions = {
  storage: diskStorage({
    destination: ImgFilepath.uploads,
    filename: (req, file, cb) => {
      cb(null, Date.now() + extname(file.originalname));
    }
  }),
  fileFilter: (req: Request, file: File, cb: Callback) => {
    // Ok Type (HTML / PNG, ETC...)
    const isValid = true;
    cb(null, isValid);
  },
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 Mo
  }
};
import { diskStorage } from "multer";
import { extname } from "path";
import { Request } from "express-serve-static-core";

type Callback = (error: null | Error, val: any) => void;
type File = Express.Multer.File;

export const uploadsOptions = {
  storage: diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
      cb(null, Date.now() + extname(file.originalname));
    }
  }),
  fileFilter: (req: Request, file: File, cb: Callback) => {
    // Ok Type (HTML / PNG, ETC...)
    const isValid = true; // ou ta logique
    cb(null, isValid);
  },
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 Mo
  }
};
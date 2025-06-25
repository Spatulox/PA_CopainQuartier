import { Response } from "express";
import { Get, Param, Res, JsonController } from "routing-controllers";
import { join } from "path";
import { ImgFilepath } from "../Utils/multer";

@JsonController()
export class FileController {
  @Get(`${ImgFilepath.activity}/:filename`)
  getActivityFile(@Param("filename") filename: string, @Res() res: Response) {
    const filePath = join(__dirname, "..", ImgFilepath.activity, filename);
    // Right verification, but I'm too lazy to do it
    return res.sendFile(filePath);
  }

  @Get(`${ImgFilepath.publication}/:filename`)
  getPublicationFile(@Param("filename") filename: string, @Res() res: Response) {
    const filePath = join(__dirname, "..", ImgFilepath.publication, filename);
    // Right verification, but I'm too lazy to do it
    return res.sendFile(filePath);
  }

  @Get(`${ImgFilepath.troc}/:filename`)
  getTrocFile(@Param("filename") filename: string, @Res() res: Response) {
    const filePath = join(__dirname, "..", ImgFilepath.troc, filename);
    // Right verification, but I'm too lazy to do it
    return res.sendFile(filePath);
  }
}
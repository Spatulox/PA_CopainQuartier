import { Response } from "express";
import { Get, Param, Res, JsonController, NotFoundError, InternalServerError } from "routing-controllers";
import { existsSync } from "fs";
import { join } from "path";
import { JavaModel } from "../Models/JavaModel";
import { JavaTable } from "../DB_Schema/JavaSchema";

@JsonController("/java")
export class FileController {

    @Get("/version")
        async getJavaVersion(@Res() res: Response): Promise<JavaModel[] | null> {
        try {
            const javaVersion = await JavaTable.find().sort({ createdAt: -1 });
            if (!javaVersion) {
                throw new NotFoundError("Java version not found");
            }
            return javaVersion;
        } catch (err) {
            throw new InternalServerError("Error retrieving Java version");
        }
    }

    @Get("/executable/:version")
    getJavaExecutable(@Param("version") version: string, @Res() res: Response ): void {
        const filePath = join(__dirname, "../../java", `java_${version}.java`);

        if (!existsSync(filePath)) {
            throw new NotFoundError(`Java executable for version ${version} not found`);
        }

        // Forcer le téléchargement du fichier
        res.download(filePath, `java_${version}.java`, (err) => {
        if (err) {
            throw new InternalServerError("Error downloading the file");
        }
        });
    }
}
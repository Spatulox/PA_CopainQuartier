import { Response } from "express";
import { Get, Param, Res, JsonController, NotFoundError, InternalServerError, Post, HttpCode, UploadedFile, Body, Authorized } from "routing-controllers";
import { existsSync } from "fs";
import { join } from "path";
import { JavaModel } from "../Models/JavaModel";
import { JavaTable } from "../DB_Schema/JavaSchema";
import { javaUploadsOptions } from "../Utils/multer";
import { zJavaUpload } from "../Validators/java";
import { UserRole } from "../DB_Schema/UserSchema";
import { getJavaFilenameByVersion, javaToObject } from "../Services/java/java";

@JsonController("/java")
export class JavaController {

    @Get("/version")
        async getJavaVersion(): Promise<JavaModel[] | null> {
        try {
            const javaVersion = await JavaTable.find().sort({ createdAt: -1 });
            if (!javaVersion) {
                throw new NotFoundError("Java version not found");
            }
            return javaVersion.map(javaToObject);
        } catch (err) {
            throw new InternalServerError("Error retrieving Java version");
        }
    }

    @Post("/")
    @Authorized(UserRole.admin)
    @HttpCode(201)
    async uploadNewJavaVersion(@Body() body: string, @UploadedFile("jar", { options: javaUploadsOptions }) javafile: Express.Multer.File): Promise<boolean> {

        if(!javafile){
            return false
        }

        const validBody = zJavaUpload.parse(body)
        const java = await JavaTable.create(
            {
                version: validBody.version,
                createdAt: new Date(),
                filename: javafile.filename,
            },
        )
        return !!java && !!java._id
    }
}

export async function getJavaJarUpdate(res: Response, version: string){
    version = version.trim()
    if (!/^[\w\-.]+$/.test(version)) {
        throw new NotFoundError("Invalid version format");
    }

    const filename = await getJavaFilenameByVersion(version)

    const filePath = join(__dirname, "../../java/versions", `${filename}`);
    if (!existsSync(filePath)) {
        res.status(404).send({ message: `Java jar not found` });
        return
    }

    res.download(filePath, (err) => {
        if (err) {
            console.error("Error sending the file:", err);
        }
    });
}

export function getJavaExecutable(res: Response, os: string){
    if(os!= "win" && os != "linux"){
        return
    }

    let name = "JavaApp-Setup-Win.exe"
    if(os == "linux"){
        name = "JavaApp-Setup-deb.deb"
    }

    const filePath = join(__dirname, "../../java", name);
    if (!existsSync(filePath)) {
        res.status(404).send({ message: `Java executable not found` });
        return
    }

    res.download(filePath, (err) => {
        if (err) {
            console.error("Error sending the file:", err);
        }
    });
}
import { Response } from "express";
import { Get, Param, Res, JsonController, NotFoundError, InternalServerError } from "routing-controllers";
import { existsSync } from "fs";
import { join } from "path";
import { JavaModel } from "../Models/JavaModel";
import { JavaTable } from "../DB_Schema/JavaSchema";

function javaToObject(java: any): JavaModel{
    const res: JavaModel = {
        _id: java._id.toString(),
        version: java.version.toString(),
        createdAt: java.createdAt.toString(),
    }
    return res
}

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
}

export function getJavaExecutable(res: Response, version: string){
    version = version.trim()
    if (!/^[\w\-.]+$/.test(version)) {
        throw new NotFoundError("Invalid version format");
    }

    const filePath = join(__dirname, "../../java", `${version}.java`);
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
import { JavaModel } from "../../Models/JavaModel"

export function getJavaFilenameFromVersion(version: string){

}


export function javaToObject(java: any): JavaModel{
    const res: JavaModel = {
        _id: java._id.toString(),
        version: java.version.toString(),
        createdAt: java.createdAt.toString(),
        filename: java.filename.toString()
    }
    return res
}
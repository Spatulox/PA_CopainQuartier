import { JavaTable } from "../../DB_Schema/JavaSchema"
import { JavaModel } from "../../Models/JavaModel"

export async function getJavaFilenameByVersion(version: string){

    const java = await JavaTable.findOne(
        {version: version}
    )
    console.log(java)
    return javaToObject(java).filename
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
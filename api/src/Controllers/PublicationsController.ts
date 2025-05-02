import { Authorized, Body, CurrentUser, Delete, ForbiddenError, Get, JsonController, Param, Patch, Post } from "routing-controllers";
import { Publication } from "../Models/PublicationModel";
import { getAllPublications, getPublicationById, deletePublicationById, createPublication, updatePublicationcontent, getAllMyPublications } from "../Services/publications/publications";
import { zId, zObjectId } from "../Validators/utils";
import { User } from "../Models/UserModel";
import { zCreatePublication, zUpdatePublication } from "../Validators/publications";
import { UserRole } from "../DB_Schema/UserSchema";


@JsonController()
export class PublicationsController {

    @Get("/publications")
    async getAllPublications(): Promise<Publication[]>{
        return await getAllPublications()
    }

    @Get("/publications/@me")
    @Authorized()
    async getAllMyPublications(@CurrentUser() user: User): Promise<Publication[]>{
        return await getAllMyPublications(user)
    }

    @Get("/publications/:id")
    async getPublicationById(@Param("id") pub_id: string): Promise<Publication | null>{
        const validId = zObjectId.parse(pub_id)
        return await getPublicationById(validId)
    }

    @Post("/publications")
    @Authorized()
    async createPublication(@CurrentUser() user: User, @Body() body: any): Promise<boolean>{
        const validBody = zCreatePublication.parse(body)
        return await createPublication(user, validBody)
    }

    @Patch("/publications/:id")
    @Authorized()
    async updateContentPublication(@CurrentUser() user: User, @Param("id") pub_id: string, @Body() body: any): Promise<boolean>{
        const validId = zObjectId.parse(pub_id)
        const validBody = zUpdatePublication.parse(body)
        const pub = await getPublicationById(validId)
        console.log(pub)
        console.log(user)
        if(pub && pub.author_id.toString() != user._id.toString()){
            throw new ForbiddenError("This publication isn't yours")
        }
        return await updatePublicationcontent(user, pub_id, validBody)
    }

    @Delete("/publications/:id")
    @Authorized()
    async deletePublicationById(@CurrentUser() user: User, @Param("id") pub_id: string): Promise<boolean>{
        const validId = zObjectId.parse(pub_id)
        const pub = await getPublicationById(validId)
        if(pub && (pub.author_id != user._id && user.role != UserRole.admin) ){
            throw new ForbiddenError("This publication isn't yours")
        }
        return await deletePublicationById(user, validId)
    }
    
}
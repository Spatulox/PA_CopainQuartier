import { Body, CurrentUser, Delete, ForbiddenError, Get, JsonController, Param, Patch, Post } from "routing-controllers";
import { Publication } from "../Models/PublicationModel";
import { getAllPublications, getPublicationById, deletePublicationById, createPublication, updatePublicationcontent } from "../Services/publications/publications";
import { zId } from "../Validators/utils";
import { User } from "../Models/UserModel";
import { zCreatePublication, zUpdatePublication } from "../Validators/publications";
import { UserRole } from "../DB_Schema/UserSchema";


@JsonController()
export class PublicationsController {

    @Get("/publications")
    async getAllPublications(): Promise<Publication[]>{
        return await getAllPublications()
    }

    @Get("/publications/:id")
    async getPublicationById(@Param("id") pub_id: number): Promise<Publication | null>{
        const validId = zId.parse(pub_id)
        return await getPublicationById(validId)
    }

    @Post("/publications")
    async createPublication(@CurrentUser() user: User, @Body() body: any): Promise<boolean>{
        const validBody = zCreatePublication.parse(body)
        return await createPublication(user, validBody)
    }

    @Patch("/publications/:id")
    async updateContentPublication(@CurrentUser() user: User, @Param("id") pub_id: number, @Body() body: any): Promise<boolean>{
        const validId = zId.parse(pub_id)
        const validBody = zUpdatePublication.parse(body)
        return await updatePublicationcontent(user, pub_id, body)
    }

    @Delete("/publications/:id")
    async deletePublicationById(@CurrentUser() user: User, @Param("id") pub_id: number): Promise<boolean>{
        const validId = zId.parse(pub_id)
        const pub = await getPublicationById(validId)
        if(pub && (pub.author_id != user._id && user.role != UserRole.admin) ){
            throw new ForbiddenError("This publication isn't yours")
        }
        return await deletePublicationById(user, validId)
    }
    
}
import { Authorized, BadRequestError, Body, CurrentUser, Delete, ForbiddenError, Get, HttpCode, InternalServerError, JsonController, Param, Patch, Post } from "routing-controllers";
import { FilledPublication, Publication } from "../Models/PublicationModel";
import { getAllPublications, getPublicationById, deletePublicationById, createPublication, updatePublicationcontent, getAllMyPublications } from "../Services/publications/publications";
import { zObjectId } from "../Validators/utils";
import { User } from "../Models/UserModel";
import { zCreatePublication, zUpdatePublication } from "../Validators/publications";
import { UserRole } from "../DB_Schema/UserSchema";
import { ObjectID } from "../DB_Schema/connexion";


@JsonController("/publications")
export class PublicationsController {

    @Get("/")
    async getAllPublications(): Promise<FilledPublication[]>{
        return await getAllPublications()
    }

    @Get("/@me")
    @Authorized()
    async getAllMyPublications(@CurrentUser() user: User): Promise<FilledPublication[]>{
        return await getAllMyPublications(user)
    }

    @Get("/:id")
    async getPublicationById(@Param("id") pub_id: string): Promise<FilledPublication | null>{
        const validId = new ObjectID(zObjectId.parse(pub_id))
        return await getPublicationById(validId)
    }

    @Post("/")
    @Authorized()
    @HttpCode(204)
    async createPublication(@CurrentUser() user: User, @Body() body: any): Promise<void>{
        const validBody = zCreatePublication.parse(body)
        if(!await createPublication(user, validBody)){
            throw new BadRequestError()
        }
    }

    @Patch("/:id")
    @Authorized()
    @HttpCode(204)
    async updateContentPublication(@CurrentUser() user: User, @Param("id") pub_id: string, @Body() body: any): Promise<void>{
        const validId = new ObjectID(zObjectId.parse(pub_id))
        const validBody = zUpdatePublication.parse(body)
        const pub = await getPublicationById(validId)
        
        if(pub && pub.author?._id.toString() != user._id.toString()){
            throw new ForbiddenError("This publication isn't yours")
        }
        if(!await updatePublicationcontent(user, validId, validBody)){
            throw new BadRequestError()
        }
    }

    @Delete("/:id")
    @Authorized()
    @HttpCode(204)
    async deletePublicationById(@CurrentUser() user: User, @Param("id") pub_id: string): Promise<void>{
        const validId = new ObjectID(zObjectId.parse(pub_id))
        const pub = await getPublicationById(validId)
        if(pub && (pub.author?._id != user._id && user.role != UserRole.admin) ){
            throw new ForbiddenError("This publication isn't yours")
        }
        if(!await deletePublicationById(user, validId)){
            throw new BadRequestError()
        }
    }
    
}
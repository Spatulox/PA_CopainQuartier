import { Authorized, BadRequestError, Body, CurrentUser, Delete, ForbiddenError, Get, HttpCode, InternalServerError, JsonController, NotFoundError, Param, Patch, Post, UploadedFile } from "routing-controllers";
import { FilledPublication, Publication } from "../Models/PublicationModel";
import { getAllPublications, getPublicationById, deletePublicationById, createPublication, updatePublicationcontent, getAllMyPublications, getAdminPublicationById, getAllAdminPublications, getAllPublicationsByActivityId } from "../Services/publications/publications";
import { zObjectId } from "../Validators/utils";
import { User } from "../Models/UserModel";
import { zCreatePublication, zUpdatePublication } from "../Validators/publications";
import { UserRole } from "../DB_Schema/UserSchema";
import { ObjectID } from "../DB_Schema/connexion";
import { publicationUploadsOptions } from "../Utils/multer";


@JsonController("/admin/publications")
export class AdminPublicationsController {

    @Get("/")
    @Authorized(UserRole.admin)
    async getAllPublications(): Promise<FilledPublication[]>{
        return await getAllAdminPublications()
    }

    @Get("/:id")
    @Authorized(UserRole.admin)
    async getPublicationById(@Param("id") pub_id: string): Promise<FilledPublication | null>{
        const validId = new ObjectID(zObjectId.parse(pub_id))
        return await getAdminPublicationById(validId)
    }
}

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

    @Get("/activity/:id")
    async getAllPublicationsByActivityId(@Param("id") acti_id: string): Promise<FilledPublication[] | null>{
        const validId = new ObjectID(zObjectId.parse(acti_id))
        return await getAllPublicationsByActivityId(validId)
    }

    @Post("/")
    @Authorized()
    @HttpCode(204)
    async createPublication(@CurrentUser() user: User, @UploadedFile("image", { options: publicationUploadsOptions }) file: Express.Multer.File, @Body() body: any): Promise<boolean>{
        const validBody = zCreatePublication.parse(body)
        if(!await createPublication(user, validBody, file)){
            throw new BadRequestError()
        }
        return true
    }

    @Patch("/:id")
    @Authorized()
    @HttpCode(204)
    async updateContentPublication(@CurrentUser() user: User, @Param("id") pub_id: string, @Body() body: any): Promise<boolean>{
        const validId = new ObjectID(zObjectId.parse(pub_id))
        const validBody = zUpdatePublication.parse(body)
        const pub = await getPublicationById(validId)
        if(!pub){
            throw new NotFoundError()
        }
        if(pub && pub.author?._id.toString() != user._id.toString()){
            throw new ForbiddenError("This publication isn't yours")
        }
        const resp = await updatePublicationcontent(user, validId, validBody)
        if(!resp){
            throw new BadRequestError()
        }
        return true
    }

    @Delete("/:id")
    @Authorized()
    @HttpCode(204)
    async deletePublicationById(@CurrentUser() user: User, @Param("id") pub_id: string): Promise<boolean>{
        const validId = new ObjectID(zObjectId.parse(pub_id))
        const pub = await getPublicationById(validId)
        if(pub && (pub.author?._id != user._id && user.role != UserRole.admin) ){
            throw new ForbiddenError("This publication isn't yours")
        }
        if(!await deletePublicationById(user, validId)){
            throw new BadRequestError()
        }
        return true
    }
    
}
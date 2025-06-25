import { Authorized, BadRequestError, Body, CurrentUser, Delete, ForbiddenError, Get, HttpCode, InternalServerError, JsonController, NotFoundError, Param, Patch, Post, QueryParams, Req, UploadedFile } from "routing-controllers";
import { zObjectId } from "../Validators/utils";
import { FilledActivity, PublicFilledActivity } from "../Models/ActivityModel";
import { getAllPublicActivities, deleteActivity, joinActivityById, leaveActivityById, getActivityById, getMyActivities, getMyActivitiesAdmin, createActivity, updateActivity, getAllActivities } from "../Services/activities/activities";
import { UserRole } from "../DB_Schema/UserSchema";
import { User } from "../Models/UserModel";
import { CreateActivityParam, UpdateActivityParam, zActivityQuery, zCreateActivity, zUpdateActivity } from "../Validators/activities";
import { ObjectID } from "../DB_Schema/connexion";
import { uploadsOptions } from "../Utils/multer";


@JsonController("/admin/activities")
export class AdminActivityController{
    @Get("/")
    async getAllActivities(): Promise<PublicFilledActivity[]>{
        return await getAllActivities()
    }

    @Get("/:id")
    async getActivityAdminByID(@Param("id") id: string): Promise<FilledActivity | null>{
        const validID = zObjectId.parse(id)
        return await getActivityById(validID)
    }
}

@JsonController("/activities")
export class ActivityController{

    @Get("/")
    async getAllActivities(@Req() req: any): Promise<PublicFilledActivity[]> {
        if (req.user) { // Si l'utilisateur est authentifié
            return await getAllActivities();
        } else { // Sinon
            return await getAllPublicActivities();
        }
    }

    @Get("/@me")
    @Authorized()
    async getMyActivities(@CurrentUser() user: User, @QueryParams() activity?: any): Promise<FilledActivity[]>{
        if(activity){
            const validParam = zActivityQuery.parse(activity)
            return await getMyActivities(user, validParam)
        }
        return await getMyActivities(user)
    }

    @Get("/@me/admin")
    @Authorized()
    async getMyAdminActivities(@CurrentUser() user: User): Promise<FilledActivity[]>{
        return await getMyActivitiesAdmin(user)
    }

    @Get("/:id")
    async getActivityById(@Req() req: any, @Param("id") act_id: string): Promise<PublicFilledActivity | null>{
        const validId = zObjectId.parse(act_id)
        return await getActivityById(validId)
    }

    @Post("/")
    @Authorized()
    async createActivity(@CurrentUser() user: User, @UploadedFile("image", {options: uploadsOptions}) file: Express.Multer.File, @Body() body: CreateActivityParam): Promise<FilledActivity | null>{
        const validBody = zCreateActivity.parse(body)
        return await createActivity(user, validBody)
    }

    @Patch("/:id")
    @Authorized()
    async udpdateActivity(@CurrentUser() user: User, @Param("id") id: string, @Body() body: UpdateActivityParam): Promise<FilledActivity | null>{
        const validBody = zUpdateActivity.parse(body)
        const validID = zObjectId.parse(id)
        return await updateActivity(user, validBody, new ObjectID(validID))
    }

    @Patch("/:id/join")
    @Authorized()
    @HttpCode(204)
    async joinActivityById(@CurrentUser() user: User, @Param("id") act_id: string): Promise<boolean>{
        const validId = zObjectId.parse(act_id)
        const activity = await getActivityById(validId)
        if(!activity){
            throw new NotFoundError("Activity not found")
        }
        if(!await joinActivityById(user, activity)){
            throw new BadRequestError("Une erreur est survenue")
        }
        return true
    }

    @Patch("/:id/leave")
    @Authorized()
    @HttpCode(204)
    async leaveActivityById(@CurrentUser() user: User, @Param("id") act_id: string): Promise<boolean>{
        const validId = zObjectId.parse(act_id)
        const activity = await getActivityById(validId)
        if(!activity){
            throw new NotFoundError("Activity not found")
        }
        if(!await leaveActivityById(user, activity)){
            throw new BadRequestError("une erreur est survenue")
        }
        return true
    }

    @Delete("/:id")
    @Authorized()
    @HttpCode(204)
    async deleteActivity(@CurrentUser() user: User, @Param("id") act_id: string): Promise<boolean>{
        const validId = zObjectId.parse(act_id)
        const acti = await getActivityById(validId)
        if(!acti){
            throw new NotFoundError("Activity not found")
        }
        if(acti.author && user._id.toString() != acti.author._id.toString() && user.role != UserRole.admin ){
            throw new ForbiddenError("You can't delete an Activity if you are not the owner")
        }
        if(!await deleteActivity(acti)){
            throw new BadRequestError()
        }
        return true
    }
}
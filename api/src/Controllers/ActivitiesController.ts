import { Authorized, Body, CurrentUser, Delete, ForbiddenError, Get, JsonController, NotFoundError, Param, Patch, Post, Req } from "routing-controllers";
import { zId, zObjectId } from "../Validators/utils";
import { Activity, PublicActivity } from "../Models/ActivityModel";
import { getAllPublicActivities, getPublicActivityById, deleteActivity, joinActivityById, leaveActivityById, getActivityById, getMyActivities, getMyActivitiesAdmin, createActivity, updateActivity, getAllActivities } from "../Services/activities/activities";
import { UserRole } from "../DB_Schema/UserSchema";
import { User } from "../Models/UserModel";
import { CreateActivityParam, UpdateActivityParam, zCreateActivity, zUpdateActivity } from "../Validators/activities";
import { ID } from "../Utils/IDType";



@JsonController("/admin/activities")
export class AdminActivityController{
    @Get("/")
    async getAllActivities(): Promise<PublicActivity[]>{
        return await getAllActivities()
    }

    @Get("/:id")
    async getActivityAdminByID(@Param("id") id: string): Promise<Activity | null>{
        const validID = zObjectId.parse(id)
        return await getActivityById(validID)
    }
}

@JsonController("/activities")
export class ActivityController{

    @Get("/")
    async getAllActivities(@Req() req: any): Promise<PublicActivity[]> {
        if (req.user) { // Si l'utilisateur est authentifié
            return await getAllActivities();
        } else { // Sinon
            return await getAllPublicActivities();
        }
    }

    @Get("/@me")
    @Authorized()
    async getMyActivities(@CurrentUser() user: User): Promise<Activity[]>{
        return await getMyActivities(user)
    }

    @Get("/@me/admin")
    @Authorized()
    async getMyAdminActivities(@CurrentUser() user: User): Promise<Activity[]>{
        return await getMyActivitiesAdmin(user)
    }

    @Get("/:id")
    async getActivityById(@Param("id") act_id: string): Promise<PublicActivity | null>{
        const validId = zObjectId.parse(act_id)
        return await getPublicActivityById(validId)
    }

    @Post("/")
    @Authorized()
    async createActivity(@CurrentUser() user: User, @Body() body: CreateActivityParam): Promise<Activity | null>{
        const validBody = zCreateActivity.parse(body)
        return await createActivity(user, validBody)
    }

    @Patch("/:id")
    @Authorized()
    async udpdateActivity(@CurrentUser() user: User, @Param("id") id: string, @Body() body: UpdateActivityParam): Promise<Activity | null>{
        const validBody = zUpdateActivity.parse(body)
        const validID = zObjectId.parse(id)
        return await updateActivity(user, validBody, validID)
    }

    @Patch("/:id/join")
    @Authorized()
    async joinActivityById(@CurrentUser() user: User, @Param("id") act_id: string): Promise<boolean>{
        const validId = zObjectId.parse(act_id)
        const activity = await getActivityById(validId)
        if(!activity){
            throw new NotFoundError("Activity not found")
        }
        return await joinActivityById(user, activity)
    }

    @Patch("/:id/leave")
    @Authorized()
    async leaveActivityById(@CurrentUser() user: User, @Param("id") act_id: string): Promise<boolean>{
        const validId = zObjectId.parse(act_id)
        const activity = await getActivityById(validId)
        if(!activity){
            throw new NotFoundError("Activity not found")
        }
        return await leaveActivityById(user, activity)
    }

    @Delete("/:id")
    @Authorized()
    async deleteActivity(@CurrentUser() user: User, @Param("id") act_id: string): Promise<boolean>{
        const validId = zObjectId.parse(act_id)
        const acti = await getActivityById(validId)
        if(!acti){
            throw new NotFoundError("Activity not found")
        }
        if(user._id.toString() != acti.author_id.toString() && user.role != UserRole.admin ){
            throw new ForbiddenError("You can't delete an Activity if you are not the owner")
        }
        return await deleteActivity(acti)
    }
}
import { Authorized, CurrentUser, Delete, ForbiddenError, Get, JsonController, NotFoundError, Param, Patch } from "routing-controllers";
import { zId, zObjectId } from "../Validators/utils";
import { Activity, PublicActivity } from "../Models/ActivityModel";
import { getAllPublicActivities, getPublicActivityById, deleteActivity, joinActivityById, leaveActivityById, getActivityById, getMyActivities, getMyActivitiesAdmin } from "../Services/activities/activities";
import { UserRole } from "../DB_Schema/UserSchema";
import { User } from "../Models/UserModel";

@JsonController()
export class ActivityController{

    @Get("/activities")
    async getAllActivities(): Promise<PublicActivity[]>{
        return await getAllPublicActivities()
    }

    @Get("/activities/@me")
    @Authorized()
    async getMyActivities(@CurrentUser() user: User): Promise<Activity[]>{
        return await getMyActivities(user)
    }

    @Get("/activities/@me/admin")
    @Authorized()
    async getMyAdminActivities(@CurrentUser() user: User): Promise<Activity[]>{
        return await getMyActivitiesAdmin(user)
    }

    @Get("/activities/:id")
    async getActivityById(@Param("id") act_id: string): Promise<PublicActivity | null>{
        const validId = zObjectId.parse(act_id)
        return await getPublicActivityById(validId)
    }


    @Patch("/activities/:id/join")
    @Authorized()
    async joinActivityById(@CurrentUser() user: User, @Param("id") act_id: string): Promise<boolean>{
        const validId = zObjectId.parse(act_id)
        const activity = await getActivityById(validId)
        if(!activity){
            throw new NotFoundError("Activity not found")
        }
        return await joinActivityById(user, activity)
    }

    @Patch("/activities/:id/leave")
    @Authorized()
    async leaveActivityById(@CurrentUser() user: User, @Param("id") act_id: string): Promise<boolean>{
        const validId = zObjectId.parse(act_id)
        const activity = await getActivityById(validId)
        if(!activity){
            throw new NotFoundError("Activity not found")
        }
        return await leaveActivityById(user, activity)
    }

    @Delete("/activities/:id")
    @Authorized()
    async deleteActivity(@CurrentUser() user: User, @Param("id") act_id: string): Promise<boolean>{
        const validId = zObjectId.parse(act_id)
        const acti = await getActivityById(validId)
        if(!acti){
            throw new NotFoundError("Activity not found")
        }
        if(user._id != acti.author_id && user.role != UserRole.admin ){
            throw new ForbiddenError("You can't delete an Activity if you are not the owner")
        }
        return await deleteActivity(acti)
    }
}
import {
    JsonController,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Authorized,
    CurrentUser,
    Patch
  } from "routing-controllers";
import { Troc, TrocStatus } from "../Models/TrocModel";
import { User } from "../Models/UserModel";
import { CreateTrocBody, UpdateTrocBody, zApproveTroc, zCreateTrocSchema, zUpdateTrocSchema } from "../Validators/trocs";
import { zObjectId } from "../Validators/utils";
import { cancelTroc, completeTroc, createTroc, deleteTroc, getAllAdminTrocs, getAllMyTrocs, getAllTrocs, getTrocById, reserveTroc, updateTroc } from "../Services/trocs/trocs";
import { UserRole } from "../DB_Schema/UserSchema";
import { getWaitingTrocs, updateWaitingTrocStatus } from "../Services/trocs/trocsAdmin";
  

@JsonController("/admin/trocs")
export class AdminTrocController {
    @Get("/")
    @Authorized(UserRole.admin)
    async getNonApprovedTroc(): Promise<Troc[] | null> {
        return await getWaitingTrocs();
    }

    @Get("/all")
    @Authorized(UserRole.admin)
    async getAllTroc(): Promise<Troc[] | null> {
        return await getAllAdminTrocs();
    }

    @Patch("/:id/approve")
    @Authorized(UserRole.admin)
    async approveTroc(@CurrentUser() user: User, @Param("id") id: string, @Body() body: any): Promise<Troc | null> {
        const validID = zObjectId.parse(id)
        const validApprove = zApproveTroc.parse(body)
        if(validApprove.approve == true){
            return await updateWaitingTrocStatus(validID, TrocStatus.pending, user);
        }
        return await updateWaitingTrocStatus(validID, TrocStatus.hide, user);
    }
}

@JsonController("/trocs")
export class TrocController {
    @Get("/")
    async getAllTrocs(): Promise<Troc[]> {
        return await getAllTrocs()
    }

    @Get("/@me")
    @Authorized()
    async getAllMyTrocs(@CurrentUser() user: User): Promise<Troc[]> {
        return await getAllMyTrocs(user)
    }

    @Get("/:id")
    async getTrocById(@Param("id") id: string): Promise<Troc | null> {
        const validId = zObjectId.parse(id);
        return await getTrocById(validId);
    }
  
    @Post("/")
    @Authorized()
    async createTroc(@Body() body: CreateTrocBody, @CurrentUser() user: User): Promise<Troc> {
        const validData = zCreateTrocSchema.parse(body)
        return await createTroc(validData, user);
    }
  
    @Put("/:id")
    @Authorized()
    async updateTroc(@Param("id") id: string, @Body() body: UpdateTrocBody, @CurrentUser() user: User): Promise<Troc | null> {
        const validId = zObjectId.parse(id);
        const validData = zUpdateTrocSchema.parse(body)
        return await updateTroc(validId, user._id, validData);
    }
  
    @Delete("/:id")
    @Authorized()
    async deleteTroc(@Param("id") id: string, @CurrentUser() user: User): Promise<boolean> {
        const validId = zObjectId.parse(id);
        const isAdmin = user.role === "admin";
        return await deleteTroc(validId, user._id, isAdmin);
    }
  
    @Patch("/:id/reserve")
    @Authorized()
    async reserveTroc(@Param("id") id: string, @CurrentUser() user: User): Promise<Troc | null> {
        const validId = zObjectId.parse(id);
        return await reserveTroc(validId, user._id);
    }
  
    @Patch("/:id/complete")
    @Authorized()
    async completeTroc(@Param("id") id: string, @CurrentUser() user: User): Promise<Troc | null> {
        const validId = zObjectId.parse(id);
        return await completeTroc(validId, user._id);
    }
  
    @Patch("/:id/cancel")
    @Authorized()
    async cancelTroc(@Param("id") id: string, @CurrentUser() user: User): Promise<Troc | null> {
        const validId = zObjectId.parse(id);
        return await cancelTroc(validId, user._id);
    }
}
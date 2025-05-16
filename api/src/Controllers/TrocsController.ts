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
    Patch,
    ForbiddenError,
    HttpCode,
    InternalServerError,
    BadRequestError
  } from "routing-controllers";
import { Troc, TrocStatus } from "../Models/TrocModel";
import { User } from "../Models/UserModel";
import { CreateTrocBody, UpdateTrocBody, zCreateTrocSchema, zUpdateTrocSchema } from "../Validators/trocs";
import { zApprove, zObjectId } from "../Validators/utils";
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
    @HttpCode(204)
    async approveTroc(@CurrentUser() user: User, @Param("id") id: string, @Body() body: any): Promise<void> {
        const validID = zObjectId.parse(id)
        const validApprove = zApprove.parse(body)
        if(validApprove.approve == true){
            if(!await updateWaitingTrocStatus(validID, TrocStatus.pending, user)){
                throw new BadRequestError()
            };
        }
        if(!await updateWaitingTrocStatus(validID, TrocStatus.hide, user)){
            throw new BadRequestError()
        };
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
    @HttpCode(204)
    async updateTroc(@Param("id") id: string, @Body() body: UpdateTrocBody, @CurrentUser() user: User): Promise<void> {
        const validId = zObjectId.parse(id);
        const validData = zUpdateTrocSchema.parse(body)
        if(!await updateTroc(validId, user._id, validData)){
            throw new BadRequestError()
        };
    }
  
    @Delete("/:id")
    @Authorized()
    @HttpCode(204)
    async deleteTroc(@Param("id") id: string, @CurrentUser() user: User): Promise<void> {
        const validId = zObjectId.parse(id);
        const isAdmin = user.role === "admin";
        if(!await deleteTroc(validId, user._id, isAdmin)){
            throw new BadRequestError()
        };
    }
  
    @Patch("/:id/reserve")
    @Authorized()
    @HttpCode(204)
    async reserveTroc(@Param("id") id: string, @CurrentUser() user: User): Promise<void> {
        const validId = zObjectId.parse(id);
        if(!await reserveTroc(validId, user._id)){
            throw new BadRequestError()
        };
    }
  
    @Patch("/:id/complete")
    @Authorized()
    @HttpCode(204)
    async completeTroc(@Param("id") id: string, @CurrentUser() user: User): Promise<void> {
        const validId = zObjectId.parse(id);
        if(!await completeTroc(validId, user._id)){
            throw new BadRequestError()
        };
    }
  
    @Patch("/:id/cancel")
    @Authorized()
    @HttpCode(204)
    async cancelTroc(@Param("id") id: string, @CurrentUser() user: User): Promise<void> {
        const validId = zObjectId.parse(id);
        if(!await cancelTroc(validId, user._id)){
            throw new BadRequestError()
        };
    }
}
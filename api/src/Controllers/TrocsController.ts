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
import { FilledTroc, Troc, TrocStatus } from "../Models/TrocModel";
import { User } from "../Models/UserModel";
import { CreateTrocBody, UpdateTrocBody, zCreateTrocSchema, zUpdateTrocSchema } from "../Validators/trocs";
import { zApprove, zObjectId } from "../Validators/utils";
import { cancelTroc, completeTroc, createTroc, deleteTroc, getAllMyTrocs, getAllTrocs, getTrocById, reserveTroc, updateTroc } from "../Services/trocs/trocs";
import { UserRole } from "../DB_Schema/UserSchema";
import { getAllAdminTrocs, getWaitingTrocs, updateWaitingTrocStatus } from "../Services/trocs/trocsAdmin";
import { ObjectID } from "../DB_Schema/connexion";
  

@JsonController("/admin/trocs")
export class AdminTrocController {
    @Get("/")
    @Authorized(UserRole.admin)
    async getNonApprovedTroc(): Promise<FilledTroc[] | null> {
        return await getWaitingTrocs();
    }

    @Get("/all")
    @Authorized(UserRole.admin)
    async getAllTroc(): Promise<FilledTroc[] | null> {
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
    async getAllTrocs(): Promise<FilledTroc[]> {
        return await getAllTrocs()
    }

    @Get("/@me")
    @Authorized()
    async getAllMyTrocs(@CurrentUser() user: User): Promise<FilledTroc[]> {
        return await getAllMyTrocs(user)
    }

    @Get("/:id")
    async getTrocById(@Param("id") id: string): Promise<FilledTroc | null> {
        const validId = zObjectId.parse(id);
        return await getTrocById(new ObjectID(validId));
    }
  
    @Post("/")
    @Authorized()
    async createTroc(@Body() body: CreateTrocBody, @CurrentUser() user: User): Promise<FilledTroc> {
        const validData = zCreateTrocSchema.parse(body)
        return await createTroc(validData, user);
    }
  
    @Put("/:id")
    @Authorized()
    @HttpCode(204)
    async updateTroc(@Param("id") id: string, @Body() body: UpdateTrocBody, @CurrentUser() user: User): Promise<void> {
        const validId = zObjectId.parse(id);
        const validData = zUpdateTrocSchema.parse(body)
        if(!await updateTroc(new ObjectID(validId), user._id, validData)){
            throw new BadRequestError()
        };
    }
  
    @Delete("/:id")
    @Authorized()
    @HttpCode(204)
    async deleteTroc(@Param("id") id: string, @CurrentUser() user: User): Promise<void> {
        const validId = zObjectId.parse(id);
        const isAdmin = user.role === "admin";
        if(!await deleteTroc(new ObjectID(validId), user._id, isAdmin)){
            throw new BadRequestError()
        };
    }
  
    @Patch("/:id/reserve")
    @Authorized()
    @HttpCode(204)
    async reserveTroc(@Param("id") id: string, @CurrentUser() user: User): Promise<void> {
        const validId = zObjectId.parse(id);
        if(!await reserveTroc(new ObjectID(validId), user._id)){
            throw new BadRequestError()
        };
    }
  
    @Patch("/:id/complete")
    @Authorized()
    @HttpCode(204)
    async completeTroc(@Param("id") id: string, @CurrentUser() user: User): Promise<void> {
        const validId = zObjectId.parse(id);
        if(!await completeTroc(new ObjectID(validId), user._id)){
            throw new BadRequestError()
        };
    }
  
    @Patch("/:id/cancel")
    @Authorized()
    @HttpCode(204)
    async cancelTroc(@Param("id") id: string, @CurrentUser() user: User): Promise<void> {
        const validId = zObjectId.parse(id);
        if(!await cancelTroc(new ObjectID(validId), user._id)){
            throw new BadRequestError()
        };
    }
}
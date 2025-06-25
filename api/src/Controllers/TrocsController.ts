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
    BadRequestError,
    QueryParams,
    UploadedFile
  } from "routing-controllers";
import { FilledTroc, Troc, TrocStatus } from "../Models/TrocModel";
import { User } from "../Models/UserModel";
import { CreateTrocBody, UpdateTrocBody, zCreateTrocSchema, zTrocAction, zTrocQuery, zUpdateTrocSchema } from "../Validators/trocs";
import { zApprove, zObjectId } from "../Validators/utils";
import { cancelTroc, completeTroc, createTroc, deleteTroc, getAllMyTrocs, getAllMyTrocsApplied, getAllTrocs, getTrocById, leaveTroc, reserveTroc, updateTroc } from "../Services/trocs/trocs";
import { UserRole } from "../DB_Schema/UserSchema";
import { getAllAdminTrocs, getWaitingTrocs, updateWaitingTrocStatus, getAdminTrocById } from "../Services/trocs/trocsAdmin";
import { ObjectID } from "../DB_Schema/connexion";
import { z } from "zod";
import { trocUploadsOptions } from "../Utils/multer";
  

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

    @Get("/:id")
    @Authorized(UserRole.admin)
    async getAdminTrocByID(@Param("id") id: string): Promise<FilledTroc | null> {
        const validID = new ObjectID(zObjectId.parse(id))
        return await getAdminTrocById(validID);
    }

    @Patch("/:id/approve")
    @Authorized(UserRole.admin)
    @HttpCode(204)
    async approveTroc(@CurrentUser() user: User, @Param("id") id: string, @Body() body: any): Promise<boolean> {
        const validID = zObjectId.parse(id)
        const validApprove = zApprove.parse(body)
        if(validApprove.approve == true){
            if(!await updateWaitingTrocStatus(validID, TrocStatus.pending, user)){
                throw new BadRequestError()
            };
            return true
        }
        if(!await updateWaitingTrocStatus(validID, TrocStatus.hide, user)){
            throw new BadRequestError()
        };
        return true
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
    async getAllMyTrocs(@CurrentUser() user: User, @QueryParams() trocs?: any): Promise<FilledTroc[]> {
        if(trocs){
            const validParam = zTrocQuery.parse(trocs)
            if(validParam.applied){
                return await getAllMyTrocsApplied(user)
            } else {
                return await getAllMyTrocs(user)
            }
        }
        return await getAllMyTrocs(user)
    }

    @Get("/:id")
    async getTrocById(@Param("id") id: string): Promise<FilledTroc | null> {
        const validId = zObjectId.parse(id);
        return await getTrocById(new ObjectID(validId));
    }
  
    @Post("/")
    @Authorized()
    async createTroc(@UploadedFile("image", {options: trocUploadsOptions}) file: Express.Multer.File, @Body() body: CreateTrocBody, @CurrentUser() user: User): Promise<FilledTroc> {
        const validData = zCreateTrocSchema.parse(body)
        console.log(file)
        return await createTroc(validData, user, file);
    }
  
    @Patch("/:id")
    @Authorized()
    @HttpCode(204)
    async updateTroc(@Param("id") id: string, @Body() body: UpdateTrocBody, @CurrentUser() user: User): Promise<boolean> {
        const validId = zObjectId.parse(id);
        const validData = zUpdateTrocSchema.parse(body)
        if(!await updateTroc(new ObjectID(validId), user._id, validData)){
            throw new BadRequestError()
        };
        return true
    }
  
    @Delete("/:id")
    @Authorized()
    @HttpCode(204)
    async deleteTroc(@Param("id") id: string, @CurrentUser() user: User): Promise<boolean> {
        const validId = zObjectId.parse(id);
        const isAdmin = user.role === "admin";
        if(!await deleteTroc(new ObjectID(validId), user._id, isAdmin)){
            throw new BadRequestError()
        };
        return true
    }

    @Patch("/:id/:action")
    @Authorized()
    @HttpCode(204)
    async handleTrocAction(@Param("id") id: string, @Param("action") action: string, @CurrentUser() user: User ): Promise<boolean> {
        const validId = zObjectId.parse(id);
        const validAction = zTrocAction.parse(action);

        const actionMap = {
            reserve: reserveTroc,
            complete: completeTroc,
            cancel: cancelTroc,
            leave: leaveTroc,
        };

        const actionFn = actionMap[validAction];
        if (!actionFn) {
            throw new BadRequestError("Action inconnue");
        }

        if (!(await actionFn(new ObjectID(validId), user._id))) {
            throw new BadRequestError();
        }
        return true;
    }
}
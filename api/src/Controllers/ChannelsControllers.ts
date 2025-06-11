import { Authorized, BadRequestError, Body, CurrentUser, Delete, ForbiddenError, Get, HttpCode, InternalServerError, JsonController, NotFoundError, Param, Patch, Post } from "routing-controllers";
import { zId, zObjectId } from "../Validators/utils";
import { addSomeoneFromChannel, createChannel, deleteChannel, deleteMessageFromChannel, getChannelById, getPublicChannelById, saveMessageToChannel, removeSomeoneFromChannel, updateChannelAdmin, updateChannelAttribute, getMyChannel, getAllChannel, deleteChannelLinkedTOActivity } from "../Services/channels/channels";
import { User } from "../Models/UserModel";
import { UserRole } from "../DB_Schema/UserSchema";
import { zCreateChannel, zTransferChannel, zUpdateChannel } from "../Validators/channels";
import { Channel, FilledChannel, PublicChannel, PublicFilledChannel } from "../Models/ChannelModel";
import { ObjectID } from "../DB_Schema/connexion";


@JsonController("/admin/channels")
export class AdminChannelsController {

    @Get("/")
    @Authorized(UserRole.admin)
    async getChannel(@CurrentUser() user: User): Promise<FilledChannel[] | null>{
        return await getAllChannel(user)
    }

    @Get("/:id")
    @Authorized(UserRole.admin)
    async getChannelById(@CurrentUser() user: User, @Param('id') channel_id: string): Promise<FilledChannel | null>{
        const validId = new ObjectID(zObjectId.parse(channel_id))
        return await getChannelById(validId)
    }
}

@JsonController("/channels")
export class ChannelsController {

    @Get('/@me')
    @Authorized()
    async getMyChannel(@CurrentUser() user: User): Promise<FilledChannel[] | null> {
        return await getMyChannel(user)
    }

    @Get('/:id')
    @Authorized()
    async getChannelById(@CurrentUser() user: User, @Param('id') channel_id: string): Promise<FilledChannel | PublicFilledChannel | null> {
        const validId = new ObjectID(zObjectId.parse(channel_id))
        
        try{
            const channel = await getChannelById(validId)
            // If the user is inside the channel, can see all data
            if (
                channel?.members.some(id => id._id.toString() === user._id.toString()) ||
                channel?.admin?._id.toString() === user._id.toString()
            ){
                return channel
            }
            // If the user is outside the channel, can only see the Public data (name, type, description...)
            else {
                return await getPublicChannelById(validId)
            }
        } catch(e){
            throw new InternalServerError("Something went wrong")
        }
        
    }

    @Post("/")
    @Authorized()
    async createChannel(@CurrentUser() user: User, @Body() body: any):Promise<FilledChannel | null>{
        const validData = zCreateChannel.parse(body)
        return await createChannel(user, validData)
    }

    @Patch("/:channel_id/adduser/:user_id")
    @Authorized()
    @HttpCode(204)
    async addUserFromChannel(@CurrentUser() user: User, @Param('user_id') user_id: string, @Param('channel_id') channel_id: string):Promise<boolean>{
        const validUserId = new ObjectID(zObjectId.parse(user_id))
        const validChannelId = new ObjectID(zObjectId.parse(channel_id))

        const channel = await getChannelById(validChannelId)
        if(channel && (channel.admin?._id.toString() != user._id.toString() && user.role != UserRole.admin)){
            throw new ForbiddenError("You can't add someone to the chat unless you are the admin")
        }
        const res = await addSomeoneFromChannel(validChannelId, validUserId)
        if(!res && res != null){
            throw new BadRequestError()
        }
        if(res == null){
            throw new BadRequestError("Vous êtes déjà dans ce channel...")
        }
        return true
    }

    @Patch("/:channel_id/removeuser/:user_id")
    @Authorized()
    @HttpCode(204)
    async removeUserFromChannel(@CurrentUser() user: User, @Param('user_id') user_id: string, @Param('channel_id') channel_id: string):Promise<boolean>{
        const validUserId = new ObjectID(zObjectId.parse(user_id))
        const validChannelId = new ObjectID(zObjectId.parse(channel_id))

        const channel = await getChannelById(validChannelId)
        if(channel && user._id.toString() != user_id &&(channel.admin?._id.toString() != user._id.toString() && user.role != UserRole.admin)){
            throw new ForbiddenError("You can't remove someone to the chat unless you are the admin")
        }
        if(!await removeSomeoneFromChannel(validChannelId, validUserId)){
            throw new BadRequestError()
        }
        return true
    }

    @Patch('/:id')
    @Authorized()
    @HttpCode(204)
    async updateChannel(@CurrentUser() user: User, @Param('id') channel_id: number, @Body() body: any): Promise<boolean> {
        const validId = new ObjectID(zObjectId.parse(channel_id))
        const channel = await getChannelById(validId)
        if (channel && (channel.admin?._id.toString() != user._id.toString() && user.role != UserRole.admin)){
            throw new ForbiddenError("You are not the admin of the channel")
        }
        const validBody = zUpdateChannel.parse(body)
        if(!await updateChannelAttribute(validId, validBody)){
            throw new BadRequestError()
        }
        return true
    }

    @Patch('/transfer/:id')
    @Authorized()
    @HttpCode(204)
    async transferChannel(@CurrentUser() user: User, @Param('id') channel_id: string, @Body() body: any): Promise<boolean> {
        const validId = new ObjectID(zObjectId.parse(channel_id))
        const channel = await getChannelById(validId)
        if (channel && (channel.admin?._id.toString() != user._id.toString() && user.role != UserRole.admin)){
            throw new ForbiddenError("You can't transfer the admin right to another person")
        }
        const validBody = zTransferChannel.parse(body)
        if(!await updateChannelAdmin(validBody, validId)){
            throw new BadRequestError()
        }
        return true
    }


    @Delete("/:id")
    @Authorized()
    @HttpCode(204)
    async deleteChannel(@CurrentUser() user: User, @Param("id") channel_id: string): Promise<boolean>{
        const validId = new ObjectID(zObjectId.parse(channel_id))
        
        const channel = await getChannelById(validId)
        if(channel && (channel.admin?._id.toString() != user._id.toString() && user.role != UserRole.admin)){
            throw new ForbiddenError("You can't delete a channel you don't own")
        }

        if(channel && channel.activity?._id){
            if(await deleteChannelLinkedTOActivity(validId, new ObjectID(channel.activity._id.toString()))){
                return true
            }
            throw new ForbiddenError("Impossible to delete a channel linked to an activity")
        }

        if(!await deleteChannel(validId)){
            throw new BadRequestError()
        }
        return true
    }
}
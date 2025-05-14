import { Authorized, Body, CurrentUser, Delete, ForbiddenError, Get, JsonController, NotFoundError, Param, Patch, Post } from "routing-controllers";
import { zId, zObjectId } from "../Validators/utils";
import { addSomeoneFromChannel, createChannel, deleteChannel, deleteMessageFromChannel, getChannelById, getPublicChannelById, saveMessageToChannel, removeSomeoneFromChannel, updateChannelAdmin, updateChannelAttribute, getMyChannel } from "../Services/channels/channels";
import { User } from "../Models/UserModel";
import { UserRole } from "../DB_Schema/UserSchema";
import { zCreateChannel, zTransferChannel, zUpdateChannel } from "../Validators/channels";
import { Channel, PublicChannel } from "../Models/ChannelModel";


@JsonController("/channels")
export class ChannelsController {

    @Get('/@me')
    @Authorized()
    async getMyChannel(@CurrentUser() user: User): Promise<Channel[] | null> {
        return await getMyChannel(user)
    }

    @Get('/:id')
    @Authorized()
    async getChannelById(@CurrentUser() user: User, @Param('id') channel_id: string): Promise<Channel | PublicChannel | null> {
        const validId = zObjectId.parse(channel_id)
        // If the user is inside the channel, can see all data
        if (user.group_chat_list_ids.map(id => id.toString()).includes(validId)) {
            return await getChannelById(validId)
        }
        // If the user is outside the channel, can only see the Public data (name, type, description...)
        else {
            return await getPublicChannelById(validId)
        }
        
    }

    @Post("/")
    @Authorized()
    async createChannel(@CurrentUser() user: User, @Body() body: any):Promise<Channel | null>{
        const validData = zCreateChannel.parse(body)
        return await createChannel(user, validData)
    }

    @Post("/invite/:id")
    @Authorized()
    async inviteChannel(@CurrentUser() user: User, @Param("id")id: string):Promise<boolean>{
        const validID = zObjectId.parse(id)
        const channel = getChannelById(validID)
        if(!channel){
            throw new NotFoundError("This channel doesn't exist")
        }
        return await addSomeoneFromChannel(validID, user._id)
    }

    @Patch("/:channel_id/adduser/:user_id")
    @Authorized()
    async addUserFromChannel(@CurrentUser() user: User, @Param('user_id') user_id: string, @Param('channel_id') channel_id: string):Promise<boolean>{
        const validUserId = zObjectId.parse(user_id)
        const validChannelId = zObjectId.parse(channel_id)

        const channel = await getChannelById(validChannelId)
        if(channel && (channel.admin_id.toString() != user._id.toString() && user.role != UserRole.admin)){
            throw new ForbiddenError("You can't add someone to the chat unless you are the admin")
        }
        return await addSomeoneFromChannel(validChannelId, validUserId)
    }

    @Patch("/:channel_id/removeuser/:user_id")
    @Authorized()
    async removeUserFromChannel(@CurrentUser() user: User, @Param('user_id') user_id: string, @Param('channel_id') channel_id: string):Promise<boolean>{
        const validUserId = zObjectId.parse(user_id)
        const validChannelId = zObjectId.parse(channel_id)

        const channel = await getChannelById(validChannelId)
        if(channel && user._id.toString() != user_id &&(channel.admin_id.toString() != user._id.toString() && user.role != UserRole.admin)){
            throw new ForbiddenError("You can't remove someone to the chat unless you are the admin")
        }
        return await removeSomeoneFromChannel(validChannelId, validUserId)
    }

    /* Useless, messages are now websockets */
    /*
    @Patch("/:channel_id/message/create")
    @Authorized()
    async sendMessageToChannel(@CurrentUser() user: User, @Param("channel_id") channel_id: number, @Body() body: any): Promise<boolean>{
        const validChannelId = zId.parse(channel_id)
        const validMessageBody = zPostMessage.parse(body)
        const channel = await getChannelById(validChannelId)
        if(channel && !channel.members.includes(user._id)){
            throw new ForbiddenError("You don't have acces to this channe")
        }
        return await saveMessageToChannel(user, channel_id, validMessageBody)
    }

    @Delete("/channel/:channel_id/message/:message_id")
    @Authorized()
    async deleteMessageToChannel(@CurrentUser() user: User, @Param("channel_id") channel_id: number, @Param("message_id") message_id: number): Promise<boolean>{
        const validChannelId = zId.parse(channel_id)
        const validMessageId = zId.parse(message_id)
        const channel = await getChannelById(validChannelId)
        if(channel && !channel.members.includes(user._id)){
            throw new ForbiddenError("You don't have acces to this channe")
        }
        return await deleteMessageFromChannel(validChannelId, validMessageId)
    }*/

    @Patch('/:id')
    @Authorized()
    async updateChannel(@CurrentUser() user: User, @Param('id') channel_id: number, @Body() body: any): Promise<boolean> {
        const validId = zObjectId.parse(channel_id)
        const channel = await getChannelById(validId)
        if (channel && (channel.admin_id.toString() != user._id.toString() && user.role != UserRole.admin)){
            throw new ForbiddenError("You are not the admin of the channel")
        }
        const validBody = zUpdateChannel.parse(body)
        await updateChannelAttribute(channel_id, validBody)
        return true
    }

    @Patch('/transfer/:id')
    @Authorized()
    async transferChannel(@CurrentUser() user: User, @Param('id') channel_id: string, @Body() body: any): Promise<boolean> {
        const validId = zObjectId.parse(channel_id)
        const channel = await getChannelById(validId)
        if (channel && (channel.admin_id.toString() != user._id.toString() && user.role != UserRole.admin)){
            throw new ForbiddenError("You can't transfer the admin right to another person")
        }
        const validBody = zTransferChannel.parse(body)
        await updateChannelAdmin(validBody, channel_id)
        return true
    }


    @Delete("/:id")
    @Authorized()
    async deleteChannel(@CurrentUser() user: User, @Param("id") channel_id: string): Promise<boolean>{
        const validId= zObjectId.parse(channel_id)
        
        const channel = await getChannelById(validId)
        if(channel && (channel.admin_id.toString() != user._id.toString() && user.role != UserRole.admin)){
            throw new ForbiddenError("You can't delete a channel you don't own")
        }

        if(channel && channel.activity_id){
            throw new ForbiddenError("Impossible to delete a channel linked to an activity")
        }

        return await deleteChannel(channel_id)
    }
}
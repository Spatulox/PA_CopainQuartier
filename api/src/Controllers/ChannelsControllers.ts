import { Authorized, Body, BodyParam, CurrentUser, Delete, ForbiddenError, Get, JsonController, Param, Patch, Post, Put } from "routing-controllers";
import { zId, zObjectId } from "../Validators/utils";
import { addSomeoneFromChannel, createChannel, deleteChannel, deleteMessageFromChannel, getChannelById, getPublicChannelById, saveMessageToChannel, removeSomeoneFromChannel, updateChannelAdmin, updateChannelAttribute } from "../Services/channels/channels";
import { User } from "../Models/UserModel";
import { UserRole } from "../DB_Schema/UserSchema";
import { zCreateChannel, zPostMessage, zTransferChannel, zUpdateChannel } from "../Validators/channels";
import { Channel, PublicChannel } from "../Models/ChannelModel";
import { ID } from "../Utils/IDType";
import { BlobOptions } from "buffer";


@JsonController()
export class ChannelsController {

    @Get('/channels/:id')
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

    @Post("/channels/create")
    @Authorized()
    async createChannel(@CurrentUser() user: User, @Body() body: any):Promise<Channel | null>{
        const validData = zCreateChannel.parse(body)
        return await createChannel(user, validData)
    }

    @Patch("/channels/:channel_id/adduser/:user_id")
    @Authorized()
    async addUserFromChannel(@CurrentUser() user: User, @Param('user_id') user_id: string, @Param('channel_id') channel_id: string):Promise<boolean>{
        const validUserId = zObjectId.parse(user_id)
        const validChannelId = zObjectId.parse(channel_id)

        const channel = await getChannelById(validChannelId)
        if(channel && (channel.admin_id != user._id && user.role != UserRole.admin)){
            throw new ForbiddenError("You can't add someone to the chat unless you are the admin")
        }
        return await addSomeoneFromChannel(validChannelId, validUserId)
    }

    @Patch("/channels/:channel_id/removeuser/:user_id")
    @Authorized()
    async removeUserFromChannel(@CurrentUser() user: User, @Param('user_id') user_id: string, @Param('channel_id') channel_id: string):Promise<boolean>{
        const validUserId = zObjectId.parse(user_id)
        const validChannelId = zObjectId.parse(channel_id)

        const channel = await getChannelById(validChannelId)
        if(channel && (channel.admin_id != user._id && user.role != UserRole.admin)){
            throw new ForbiddenError("You can't remove someone to the chat unless you are the admin")
        }
        return await removeSomeoneFromChannel(validChannelId, validUserId)
    }

    /*
    @Patch("/channel/:channel_id/message/create")
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

    @Patch('/channels/:id')
    @Authorized()
    async updateChannel(@CurrentUser() user: User, @Param('id') channel_id: number, @Body() body: any): Promise<boolean> {
        const validId = zObjectId.parse(channel_id)
        const channel = await getChannelById(validId)
        if (channel && (channel.admin_id != user._id && user.role != UserRole.admin)){
            throw new ForbiddenError("You are not the admin of the channel")
        }
        const validBody = zUpdateChannel.parse(body)
        await updateChannelAttribute(channel_id, validBody)
        return true
    }

    @Patch('/channels/transfer/:id')
    @Authorized()
    async transferChannel(@CurrentUser() user: User, @Param('id') channel_id: string, @Body() body: any): Promise<boolean> {
        const validId = zObjectId.parse(channel_id)
        const channel = await getChannelById(validId)
        if (channel && (channel.admin_id != user._id && user.role != UserRole.admin)){
            throw new ForbiddenError("You can't transfer the admin right to another person")
        }
        const validBody = zTransferChannel.parse(body)
        await updateChannelAdmin(validBody, channel_id)
        return true
    }


    @Delete("/channels/delete/:id")
    @Authorized()
    async deleteChannel(@CurrentUser() user: User, @Param("id") channel_id: string): Promise<boolean>{
        const validId= zObjectId.parse(channel_id)
        
        const channel = await getChannelById(validId)
        if(channel && (channel.admin_id!= user._id && user.role != UserRole.admin)){
            throw new ForbiddenError("You can't delete a channel you don't own")
        }

        return await deleteChannel(channel_id)
    }
}
import { Authorized, Body, BodyParam, CurrentUser, Delete, ForbiddenError, Get, JsonController, Param, Patch, Post, Put } from "routing-controllers";
import { zId, zObjectId } from "../Validators/utils";
import { addSomeoneFromChannel, createChannel, deleteChannel, getChannelById, getPublicChannelById, removeSomeoneFromChannel, updateChannelAdmin, updateChannelAttribute } from "../Services/channels/channels";
import { User } from "../Models/UserModel";
import { UserRole } from "../DB_Schema/UserSchema";
import { zCreateChannel, zTransferChannel, zUpdateChannel } from "../Validators/channels";
import { Channel, PublicChannel } from "../Models/ChannelModel";
import { ID } from "../Utils/IDType";
import { BlobOptions } from "buffer";


@JsonController()
export class ChannelsController {

    @Get('/channels/:id')
    @Authorized()
    async getChannelById(@CurrentUser() user: User, @Param('id') channel_id: number): Promise<Channel | PublicChannel | null> {
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
    async addUserFromChannel(@CurrentUser() user: User, @Param('user_id') user_id: number, @Param('channel_id') channel_id: number):Promise<boolean>{
        const validUserId = zId.parse(user_id)
        const validChannelId = zId.parse(channel_id)

        const channel = await getChannelById(validChannelId)
        if(channel && (channel.admin_id != user._id || user.role != UserRole.admin)){
            throw new ForbiddenError("You can't add someone to the chat unless you are the admin")
        }
        return await addSomeoneFromChannel(validChannelId, validUserId)
    }

    @Patch("/channels/:channel_id/removeuser/:id")
    @Authorized()
    async removeUserFromChannel(@CurrentUser() user: User, @Param('user_id') user_id: number, @Param('channel_id') channel_id: number):Promise<boolean>{
        const validUserId = zId.parse(user_id)
        const validChannelId = zId.parse(channel_id)

        const channel = await getChannelById(validChannelId)
        if(channel && (channel.admin_id != user._id || user.role != UserRole.admin)){
            throw new ForbiddenError("You can't add someone to the chat unless you are the admin")
        }
        return await removeSomeoneFromChannel(validChannelId, validUserId)
    }

    @Patch('/channels/:id')
    @Authorized()
    async updateChannel(@CurrentUser() user: User, @Param('id') channel_id: number, @Body() body: any): Promise<boolean> {
        const validId = zObjectId.parse(channel_id)
        const channel = await getChannelById(validId)
        if (channel && (channel.admin_id != user._id || user.role != UserRole.admin)){
            throw new ForbiddenError("You are not the admin of the channel")
        }
        const validBody = zUpdateChannel.parse(body)
        await updateChannelAttribute(channel_id, validBody)
        return true
    }

    @Patch('/channels/:id/transfer')
    @Authorized()
    async transferChannel(@CurrentUser() user: User, @Param('id') channel_id: number, @Body() body: any): Promise<boolean> {
        const validId = zObjectId.parse(channel_id)
        const channel = await getChannelById(validId)
        if (channel && (channel.admin_id != user._id || user.role != UserRole.admin)){
            throw new ForbiddenError("You can't transfer the admin right to another person")
        }
        const validBody = zTransferChannel.parse(body)
        await updateChannelAdmin(validBody, channel_id)
        return true
    }


    @Delete("/channels/delete/:id")
    @Authorized()
    async deleteChannel(@CurrentUser() user: User, @Param("id") channel_id: ID): Promise<boolean>{
        const validId= zId.parse(channel_id)
        
        const channel = await getChannelById(validId)
        if(channel && (channel.admin_id!= user._id || user.role != UserRole.admin)){
            throw new ForbiddenError("You can't delete a channel you don't own")
        }

        return await deleteChannel(channel_id)
    }
}
import { Authorized, Body, BodyParam, CurrentUser, ForbiddenError, Get, JsonController, Param, Patch, Put } from "routing-controllers";
import { zObjectId } from "../Validators/utils";
import { getChannelById, getPublicChannelById, updateChannelAdmin, updateChannelAttribute } from "../Services/channels/channels";
import { User } from "../Models/UserModel";
import { UserRole } from "../DB_Schema/UserSchema";
import { zTransferChannel, zUpdateChannel } from "../Validators/channels";
import { Channel, PublicChannel } from "../Models/ChannelModel";


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
}
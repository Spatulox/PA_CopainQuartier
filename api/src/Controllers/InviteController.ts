import { Authorized, BadRequestError, Body, CurrentUser, Get, HttpCode, InternalServerError, JsonController, NotFoundError, Param, Post } from "routing-controllers";
import { User } from "../Models/UserModel";
import { InviteTable } from "../DB_Schema/InviteSchema";
import { zObjectId } from "../Validators/utils";
import { FilledInvite, Invite, PublicInvite } from "../Models/InviteModel";
import { zGenerateInvite } from "../Services/invites/invites";
import { ObjectID } from "../DB_Schema/connexion";
import { addSomeoneFromChannel, getChannelById, objectToChannel } from "../Services/channels/channels";
import { channel } from "process";


@JsonController("/invites")
export class InviteController {

  @Get('/:id')
  @Authorized()
  async getInvite(@CurrentUser() user: User, @Param("id") id: string): Promise<FilledInvite | null> {
    const validID = zObjectId.parse(id)
    try{
        const res = await InviteTable.findById(validID).populate("channel_id")
        if(!res){
            return null
        }
        return {
            _id: res._id,
            channel: res.channel_id ? objectToChannel(res.channel_id) : null
        }
    } catch(e){
        console.error(e)
        throw new InternalServerError("Something went wrong")
    }
  }

  @Post('/')
  @Authorized()
  async generateInvite(@CurrentUser() user: User, @Body() body: any): Promise<PublicInvite> {
    const validBody = zGenerateInvite.parse(body)
    const id = new ObjectID()
    const data = {
        _id: id.toString(),
        channel_id: validBody.channel_id
    }
    try{
        await InviteTable.create(data)
        return data
    } catch(e){
        console.error(e)
        throw new InternalServerError("Something went wrong")
    }
  }

  @Post('/:id')
  @Authorized()
  @HttpCode(204)
  async joinInvite(@CurrentUser() user: User, @Param("id") id: string): Promise<boolean> {
    const validID = new ObjectID(zObjectId.parse(id))
    let invite: Invite | null
    try{
        invite = await InviteTable.findById(validID)
        if(!invite){
            throw new BadRequestError("Wrong invite ID")
        }
    } catch(e){
        console.error(e)
        throw new InternalServerError("Something went wrong")
    }
    if(!invite){
        throw new BadRequestError("Invite does't not exist wtf")
    }
    console.log(invite)
    if(!invite || !invite.channel_id){
        throw new BadRequestError("This invite doesn't exist")
    }
    const channel = await getChannelById(invite.channel_id)
    if(!channel){
        throw new NotFoundError("This channel doesn't exist")
    }
    
    const res = await addSomeoneFromChannel(new ObjectID(channel._id), user._id)
    if(!res && res != null){
        throw new BadRequestError()
    }
    if(res == null){
        throw new BadRequestError("Vous êtes déjà dans ce channel...")
    }
    return true
  }

}
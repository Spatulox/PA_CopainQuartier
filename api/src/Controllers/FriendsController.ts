import { JsonController, Param, Get, Delete, CurrentUser, Authorized, Patch, HttpCode, InternalServerError } from 'routing-controllers';
import { FilledUser, User } from "../Models/UserModel"
import { getUserById } from '../Services/users/usersPublic';
import { UserTable } from '../DB_Schema/UserSchema';
import { ObjectID } from '../DB_Schema/connexion';
import { zObjectId } from '../Validators/utils';
import { zFriendsAction } from '../Validators/friends';
import { Channel } from 'diagnostics_channel';
import { ChannelTable } from '../DB_Schema/ChannelSchema';
import { ActivityTable } from '../DB_Schema/ActivitiesSchema';
import { getAFriend } from '../Services/friends/friends';
import { createChannel } from '../Services/channels/channels';

@JsonController("/friends")
export class FriendsController {

    @Get('/')
    @Authorized()
    async getAllMyFriends(@CurrentUser() user: User): Promise<FilledUser[]> {
        const friendsMap = new Map(Object.entries(user.friends_id || {}));
        const friendIds = Array.from(friendsMap.keys());

        const friends = await Promise.all(
            friendIds.map(async (friendId) => {
                return await getUserById(new ObjectID(friendId));
            })
        );

        return friends.filter(Boolean) as FilledUser[];
    }

    @Get('/:id')
    @Authorized()
    async getMyFriendByID( @CurrentUser() user: User, @Param("id") id: string): Promise<any> {
        const validId = zObjectId.parse(id);
        return getAFriend(user, new ObjectID(validId))
    }

    @Patch('/:id/:validation')
    @Authorized()
    @HttpCode(204)
    async anyAFriend(@CurrentUser() user: User, @Param("id") id: string, @Param("validation") action: string): Promise<boolean>{
        const validId = zObjectId.parse(id)
        const validAction = zFriendsAction.parse(action)
        
        let use
        if(validAction == "validate"){
            const channel = await  createChannel(user,{name: "Canal Privé", description: `Canal privé`})
            if(!channel || !channel._id){
                throw new InternalServerError("Something went wrong...")
            }

            use = await UserTable.updateOne(
                { _id: user._id },
                {
                    //$addToSet: { friends_id: validId},
                    $set: { [`friends_id.${validId}`]: channel?._id },
                    $pull: { friends_request_id: validId}
                },
                { new: true }
            )
            use = await UserTable.updateOne(
                { _id: validId },
                {
                    //$addToSet: { friends_id: user._id},
                    $set: { [`friends_id.${user._id}`]: channel?._id },
                    $pull: { friends_request_id: user._id}
                },
                { new: true }
            )

            use = await ChannelTable.updateOne(
                {_id: channel._id},
                {$addToSet: { members: validId}},
                { new: true}
            )
        } else if(validAction == "reject") {
            use = await UserTable.updateOne(
                { _id: user._id },
                { $pull: { friends_request_id: validId}},
                { new: true }
            )
        } else if(validAction == "request"){
            use = await UserTable.updateOne(
                { _id: validId },
                { $addToSet: { friends_request_id: user._id}},
                { new: true }
            )
        }

        return use!.modifiedCount >= 0
    }

    @Delete('/:id')
    @Authorized()
    @HttpCode(204)
    async deleteAFriends(@CurrentUser() user: User, @Param("id") id: string): Promise<boolean>{
        const validId = zObjectId.parse(id)
        const use = await UserTable.updateOne(
            { _id: user._id },
            { $pull: { friends_id: validId}},
            { new: true }
        )
        return use.modifiedCount >= 0
    }
}
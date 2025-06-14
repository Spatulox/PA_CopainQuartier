import { JsonController, Param, Get, Delete, CurrentUser, Authorized, Patch, HttpCode } from 'routing-controllers';
import { FilledUser, User } from "../Models/UserModel"
import { getUserById } from '../Services/users/usersPublic';
import { UserTable } from '../DB_Schema/UserSchema';
import { ObjectID } from '../DB_Schema/connexion';
import { zObjectId } from '../Validators/utils';
import { zFriendsAction } from '../Validators/friends';

@JsonController("/friends")
export class FriendsController {

    @Get('/')
    @Authorized()
    async getAllMyFriends(@CurrentUser() user: User): Promise<FilledUser[]> {
    const friends = await Promise.all(
        user.friends_id.map(async (friendId: ObjectID) => {
        return await getUserById(friendId);
        })
    );
    return friends.filter(Boolean) as FilledUser[];
    }

    @Patch('/:id/:validation')
    @Authorized()
    @HttpCode(204)
    async anyAFriend(@CurrentUser() user: User, @Param("id") id: string, @Param("validation") action: string): Promise<boolean>{
        const validId = zObjectId.parse(id)
        const validAction = zFriendsAction.parse(action)
        
        let use
        if(validAction == "validate"){
            use = await UserTable.updateOne(
                { _id: user._id },
                {
                    $addToSet: { friends_id: validId},
                    $pull: { friends_request_id: validId}
                },
                { new: true }
            )
        } else if(validAction == "reject") {
            use = await UserTable.updateOne(
                { _id: user._id },
                { $pull: { friends_request_id: validId}},
                { new: true }
            )
        } else if(validAction == "request"){
            use = await UserTable.updateOne(
                { _id: user._id },
                { $addToSet: { friends_request_id: validId}},
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
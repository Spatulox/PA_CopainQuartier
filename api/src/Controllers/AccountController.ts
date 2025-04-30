import { JsonController, Param, Body, Get, Post, Put, Delete, HeaderParam, CurrentUser, Authorized } from 'routing-controllers';
import { User } from "../Models/UserModel"
import { deleteMyAccount, getUserById } from '../Services/users/usersPublic';

@JsonController()
export class UserController {

  @Get('/account')
  @Authorized()
  async getMyAccount(@CurrentUser() user: User): Promise<User | null> {
    return await getUserById(user._id);
  }

  @Delete('/account')
  @Authorized()
  async deleteMyAccount(@CurrentUser() user: User): Promise<boolean>{
    return await deleteMyAccount(user);
  }
}
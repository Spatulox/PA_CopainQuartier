import { JsonController, Param, Body, Get, Post, Put, Delete, HeaderParam, CurrentUser, Authorized, Patch } from 'routing-controllers';
import { User } from "../Models/UserModel"
import { deleteMyAccount, getUserById } from '../Services/users/usersPublic';

@JsonController("/account")
export class AccountController {

  @Get('/')
  @Authorized()
  async getMyAccount(@CurrentUser() user: User): Promise<User | null> {
    return await getUserById(user._id);
  }

  @Delete('/')
  @Authorized()
  async deleteMyAccount(@CurrentUser() user: User): Promise<boolean>{
    return await deleteMyAccount(user);
  }
}
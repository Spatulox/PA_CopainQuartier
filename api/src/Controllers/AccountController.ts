import { JsonController, Param, Body, Get, Post, Put, Delete, HeaderParam, CurrentUser, Authorized } from 'routing-controllers';
import { User } from "../Models/UserModel"

@JsonController()
export class UserController {

  @Get('/account')
  @Authorized()
  getAll(@CurrentUser() user: User) {
    return true;
  }
}
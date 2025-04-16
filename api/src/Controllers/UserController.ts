import { JsonController, Param, Body, Get, Post, Put, Delete, HeaderParam, Authorized, CurrentUser } from 'routing-controllers';
import { User } from "../Models/UserModel"
import { ApiKey } from '../Utils/apikey';

@JsonController()
export class UserController {

  @Get('/account')
  @Authorized()
  getAll(@CurrentUser() user: User) {
    return true;
  }
}
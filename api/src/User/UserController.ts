import { JsonController, Param, Body, Get, Post, Put, Delete, HeaderParam } from 'routing-controllers';
import { User } from "./UserModel"
import { ApiKey } from '../utils/apikey';

@JsonController()
export class UserController {

  @Get('/users')
  getAll(@ApiKey() apiKey: string) {
    return true;
  }

  @Get('/users/:id')
  getOne(@ApiKey() apiKey: string, @Param('id') id: number) {
    return true;
  }

  @Post('/users')
  post(@ApiKey() apiKey: string, @Body() user: User) {
    return true;
  }
}
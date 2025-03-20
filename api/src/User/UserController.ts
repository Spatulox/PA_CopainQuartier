import { JsonController, Param, Body, Get, Post, Put, Delete } from 'routing-controllers';
import { User } from "./UserModel"

@JsonController()
export class UserController {
  @Get('/users')
  getAll() {
    return true;
  }

  @Get('/users/:id')
  getOne(@Param('id') id: number) {
    return true;
  }

  @Post('/users')
  post(@Body() user: User) {
    return true;
  }
}
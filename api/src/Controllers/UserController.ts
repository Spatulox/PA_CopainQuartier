import { JsonController, Param, Body, Get, Post, Put, Delete, HeaderParam, Authorized, CurrentUser, Patch } from 'routing-controllers';
import { User } from "../Models/UserModel"
import { deleteUser, getAllUsers, getUnverifiedUser, verifyUser } from '../Services/users/usersAdmin';
import { zApprove, zId, zObjectId } from '../Validators/utils';
import { getPublicUserById, getUserById } from '../Services/users/usersPublic';
import { UserRole } from '../DB_Schema/UserSchema';
import { ZodObject } from 'zod';

@JsonController("/admin/users")
export class AdminUserController {
  @Get('/')
  @Authorized(UserRole.admin)
  async getAll(): Promise<User[]> {
    return await getAllUsers()
  }

  @Get('/unverified')
  @Authorized(UserRole.admin)
  async getUnverifiedUser(): Promise<User[] | null> {
    return await getUnverifiedUser();
  }

  @Get('/:id')
  @Authorized(UserRole.admin)
  async getUserByIdAdmin(@Param('id') user_id: string): Promise<User | null> {
    const validId = zObjectId.parse(user_id)
    return await getUserById(validId);
  }

  @Patch('/:id')
  @Authorized(UserRole.admin)
  async verifyUser(@Param('id') user_id: string, @Body() body: any): Promise<boolean> {
    const validId = zObjectId.parse(user_id)
    const validApprove = zApprove.parse(body)
    if(validApprove.approve == true){
      return await verifyUser(validId);
    }
    return false
  }

  @Delete('/:id')
  @Authorized(UserRole.admin)
  async deleteUserById(@Param('id') user_id: string): Promise<boolean> {
    const validId = zObjectId.parse(user_id)
    return await deleteUser(validId)
  }
}

@JsonController("/users")
export class UserController {

  @Get('/@me')
  @Authorized()
  async getMe(@CurrentUser() user: User) {
    return await getUserById(user._id);
  }

  @Get('/:id')
  @Authorized()
  async getUserById(@CurrentUser() user: User, @Param('id') user_id: string) {
    const validId = zObjectId.parse(user_id)
    return await getPublicUserById(user, validId);
  }
}
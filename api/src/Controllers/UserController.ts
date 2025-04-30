import { JsonController, Param, Body, Get, Post, Put, Delete, HeaderParam, Authorized, CurrentUser } from 'routing-controllers';
import { User } from "../Models/UserModel"
import { deleteUser, getAllUsers } from '../Services/users/usersAdmin';
import { zObjectId } from '../Validators/utils';
import { getPublicUserById, getUserById } from '../Services/users/usersPublic';
import { UserRole } from '../DB_Schema/UserSchema';

@JsonController()
export class UserController {

  @Get('/users/:id')
  @Authorized()
  async getUserById(@CurrentUser() user: User, @Param('id') user_id: number) {
    const validId = zObjectId.parse(user_id)
    return await getPublicUserById(user, validId);
  }

  // --------- ADMIN --------- //
  @Get('/admin/users/all')
  @Authorized(UserRole.admin)
  async getAll(): Promise<User[]> {
    return await getAllUsers()
  }

  @Get('/admin/users/:id')
  @Authorized(UserRole.admin)
  async getUserByIdAdmin(@Param('id') user_id: number): Promise<User | null> {
    const validId = zObjectId.parse(user_id)
    return await getUserById(validId);
  }

  @Delete('/admin/user/:id')
  @Authorized(UserRole.admin)
  async deleteUserById(@Param('id') user_id: number): Promise<boolean> {
    const validId = zObjectId.parse(user_id)
    return await deleteUser(validId)
  }
}
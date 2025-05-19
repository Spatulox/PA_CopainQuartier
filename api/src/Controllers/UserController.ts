import { JsonController, Param, Body, Get, Post, Put, Delete, HeaderParam, Authorized, CurrentUser, Patch, InternalServerError, ForbiddenError, HttpCode, BadRequestError } from 'routing-controllers';
import { FilledUser, PublicUser, User } from "../Models/UserModel"
import { deleteUser, getAllUsers, getUnverifiedUser, verifyUser } from '../Services/users/usersAdmin';
import { zApprove, zObjectId } from '../Validators/utils';
import { getPublicUserById, getUserById } from '../Services/users/usersPublic';
import { UserRole } from '../DB_Schema/UserSchema';
import { ObjectID } from '../DB_Schema/connexion';

@JsonController("/admin/users")
export class AdminUserController {
  @Get('/')
  @Authorized(UserRole.admin)
  async getAll(): Promise<FilledUser[]> {
    return await getAllUsers()
  }

  @Get('/unverified')
  @Authorized(UserRole.admin)
  async getUnverifiedUser(): Promise<FilledUser[] | null> {
    return await getUnverifiedUser();
  }

  @Get('/:id')
  @Authorized(UserRole.admin)
  async getUserByIdAdmin(@Param('id') user_id: ObjectID): Promise<FilledUser | null> {
    const validId = zObjectId.parse(user_id)
    return await getUserById(new ObjectID(validId));
  }

  @Patch('/:id')
  @Authorized(UserRole.admin)
  @HttpCode(204)
  async verifyUser(@Param('id') user_id: ObjectID, @Body() body: any): Promise<boolean> {
    const validId = zObjectId.parse(user_id)
    const validApprove = zApprove.parse(body)
    if(validApprove.approve == true){
      if(!await verifyUser(new ObjectID(validId))){
        throw new BadRequestError()
      };
    }
    return true
  }

  @Delete('/:id')
  @Authorized(UserRole.admin)
  @HttpCode(204)
  async deleteUserById(@Param('id') user_id: ObjectID): Promise<boolean> {
    const validId = zObjectId.parse(user_id)
    if(!await deleteUser(new ObjectID(validId))){
      throw new BadRequestError()
    }
    return true
  }
}

@JsonController("/users")
export class UserController {

  @Get('/@me')
  @Authorized()
  async getMe(@CurrentUser() user: User): Promise<FilledUser | null> {
    return await getUserById(user._id)
  }

  @Get('/:id')
  @Authorized()
  async getUserById(@CurrentUser() user: User, @Param('id') user_id: ObjectID): Promise<PublicUser | null> {
    const validId = zObjectId.parse(user_id)
    return await getPublicUserById(user, new ObjectID(validId))
  }
}
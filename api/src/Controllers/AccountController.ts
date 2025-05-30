import { JsonController, Param, Body, Get, Post, Put, Delete, HeaderParam, CurrentUser, Authorized, Patch, BadRequestError, HttpCode, OnUndefined, ForbiddenError } from 'routing-controllers';
import { FilledUser, User } from "../Models/UserModel"
import { deleteMyAccount, getUserById, updateMyAccount } from '../Services/users/usersPublic';
import { zUpdateAccount } from '../Validators/users';
import { UserRole } from '../DB_Schema/UserSchema';

@JsonController("/account")
export class AccountController {

  @Get('/')
  @Authorized()
  async getMyAccount(@CurrentUser() user: User): Promise<FilledUser | null> {
    return await getUserById(user._id);
  }

  @Patch('/')
  @Authorized()
  @HttpCode(204)
  async updateMyAccount(@CurrentUser() user: User, @Body() body: any): Promise<boolean>{
    const validBody = zUpdateAccount.parse(body)
    if (!await updateMyAccount(user, validBody)) {
      throw new BadRequestError("Erreur lors de la mise à jour du compte");
    }
    return true
  }

  @Delete('/')
  @Authorized()
  @HttpCode(204)
  async deleteMyAccount(@CurrentUser() user: User): Promise<boolean>{

    if(user.role == UserRole.admin){
      throw new ForbiddenError("Vous ne pouvez pas supprimer votre compte, car vous êtes admin")
    }

    if (!await deleteMyAccount(user)) {
      throw new BadRequestError("Erreur lors de la suppression du compte");
    }
    return true
  }
}
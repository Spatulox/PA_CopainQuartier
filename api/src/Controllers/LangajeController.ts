import { JsonController, Post, CurrentUser, Authorized, Body } from 'routing-controllers';
import { User } from "../Models/UserModel"
import { UserRole } from '../DB_Schema/UserSchema';
import { requestDB, Result } from '../Services/langaje/langaje';
import { zLangaje } from '../Validators/langaje';

@JsonController("/admin/langaje")
export class LangajeController {

  @Post('/')
  @Authorized(UserRole.admin)
  async requestDB(@CurrentUser() user: User, @Body() query: string): Promise<Result | null> {
    const validQuery = zLangaje.parse(query);
    return await requestDB(validQuery);
  }
}
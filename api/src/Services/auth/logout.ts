import { User } from '../../Models/UserModel'
import { TokenTable } from "../../DB_Schema/TokensSchema";

export async function logout(user: User): Promise<void> {
  await TokenTable.deleteMany({ userId: user._id });
}

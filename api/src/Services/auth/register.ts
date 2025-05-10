import { UserRole, UserTable } from "../../DB_Schema/UserSchema";
import type { ConnectionToken, RegisterParams } from "../../Validators/auth";
import { generateToken, JwtType } from "./jwt";
import { hashPassword } from "./password";
import { BadRequestError } from "routing-controllers";

export async function registerUser(params: RegisterParams): Promise<ConnectionToken> {
  const user = await saveUser(params);

  const [accessToken, refreshToken] = await Promise.all([
    generateToken({
      userId: user._id,
      role: user.role,
      type: JwtType.AccessToken
    }),
    generateToken({
      userId: user._id,
      role: user.role,
      type: JwtType.RefreshToken
    })
  ]);

  return {
    accessToken,
    refreshToken
  };
}

async function saveUser(params: RegisterParams) {
  const hashedPassword = await hashPassword(params.password);
  try {

    const existingUser = await UserTable.findOne({email: params.email})
    if(existingUser){
      throw new BadRequestError("Email already exists");
    }

    const user = await UserTable.create({
      email: params.email,
      password: hashedPassword,
      role: UserRole.member,
      phone: params.phone,
      lastname: params.lastname,
      name: params.name,
      address: params.address
    });
    return user;
  } catch (e: any) {
    if (e.code === 11000) {
      throw new BadRequestError("Email already exists");
    }
    throw e;
  }
}

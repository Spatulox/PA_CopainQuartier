import { UserTable } from "../../DB_Schema/UserSchema";
import type { RegisterParams } from "../../Validators/auth";
import { generateToken, JwtType } from "./jwt";
import { hashPassword } from "./password";
import { BadRequestError } from "routing-controllers";

export async function registerUser(params: RegisterParams): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
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
    const user = await UserTable.create({
      email: params.email,
      password: hashedPassword,
      role: "customer"
    });
    return user;
  } catch (e: any) {
    if (e.code === 11000) {
      throw new BadRequestError("Email already exists");
    }
    throw e;
  }
}

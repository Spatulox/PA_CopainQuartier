import { BadRequestError } from "routing-controllers";
import { decodeJwt, generateToken, type JwtPayload, JwtType } from "./jwt";
import { hashPassword } from "./password";
import { TokenTable } from "../../DB_Schema/TokensSchema";
import { UserTable } from "../../DB_Schema/UserSchema";
import { ConnectionToken, LoginParams, Refreshtoken } from "../../Validators/auth"

export async function loginUser(params: LoginParams): Promise<ConnectionToken> {
  // Recherche de l'utilisateur par email
  const user = await UserTable.findOne({ email: params.email });
  if (!user) {
    throw new BadRequestError('Invalid email or password');
  }

  // Hash du mot de passe fourni
  const hashedPassword = await hashPassword(params.password);
  if (user.password !== hashedPassword) {
    throw new BadRequestError('Invalid email or password');
  }

  // Génération des tokens
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

export async function refreshToken(token: Refreshtoken): Promise<string> {
  const dbToken = await TokenTable.findOne({ token : token.refreshToken });
  if (!dbToken) {
    throw new BadRequestError('Invalid token');
  }

  let payload: JwtPayload;
  try {
    payload = decodeJwt(token.refreshToken);
  } catch {
    throw new BadRequestError('Invalid token');
  }

  if (payload.type !== JwtType.RefreshToken) {
    throw new BadRequestError('Invalid token');
  }

  // Génère un nouveau accessToken
  return generateToken({
    userId: payload.userId,
    role: payload.role,
    type: JwtType.AccessToken
  });
}

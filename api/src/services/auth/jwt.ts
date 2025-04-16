
import jwt from "jsonwebtoken";
import { TokenTable } from "../../DB_Schema/TokensSchema";
import config from '../../../config.json'
import { User } from "../../Models/UserModel"

export enum JwtType {
  AccessToken = 'access',
  RefreshToken = 'refresh'
}

export interface JwtPayload {
  userId: User['_id']
  role: User['role']
  type: JwtType
}

export function decodeJwt(token: string): JwtPayload {
  const payload = jwt.verify(token, config.jwtSalt)
  return payload as JwtPayload
}

function encodeJwt(payload: JwtPayload): string {
  const expiresIn = payload.type === JwtType.AccessToken ? "5d" : "7d"
  return jwt.sign(payload, config.jwtSalt, { expiresIn })
}

export async function generateToken(
  { userId, role, type }: {
    userId: User['_id'],
    role: User['role'],
    type: JwtType
  }
): Promise<string> {
  const token = encodeJwt({
    userId,
    role,
    type
  })

  // Création et sauvegarde du token dans MongoDB via Mongoose
  await TokenTable.create({
    token,
    userId,
  });

  return token;
}

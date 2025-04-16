import { type Action, UnauthorizedError } from "routing-controllers";
import { decodeJwt, type JwtPayload, JwtType } from "../services/auth/jwt";
import { TokenExpiredError } from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { User } from "../Models/UserModel";
import { TokenTable } from "../DB_Schema/TokensSchema";
import { UserTable } from "../DB_Schema/UserSchema";

// Adapter l’interface Express pour stocker les infos utilisateur
declare global {
  namespace Express {
    interface Locals {
      userId: User['_id'];
      role: User['role'];
    }
  }
}

export async function authMiddleware(action: Action, roles: User['role'][]) {
  const jwt = action.request.headers.authorization?.split(" ")[1];
  if (!jwt) {
    throw new UnauthorizedError('Unauthorized');
  }

  // Recherche du token dans la collection "tokens"
  const dbToken = await TokenTable.findOne({ token: jwt });
  if (!dbToken) {
    throw new UnauthorizedError('Unauthorized');
  }

  let jwtPayload: JwtPayload;
  try {
    jwtPayload = decodeJwt(jwt);
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new UnauthorizedError('Token expired');
    }
    throw new UnauthorizedError('Unauthorized');
  }

  if (
    jwtPayload.type !== JwtType.AccessToken ||
    (roles.length > 0 && !roles.includes(jwtPayload.role))
  ) {
    throw new UnauthorizedError('Unauthorized');
  }

  action.response.locals.userId = jwtPayload.userId;
  action.response.locals.role = jwtPayload.role;

  return true;
}

// Fonction pour récupérer l'utilisateur courant depuis MongoDB
export async function getCurrentUser(action: Action) {
  // Attention à convertir l’ID si stocké en ObjectId
  const userId = action.response.locals.userId;
  const user = await UserTable.findOne({ _id: new ObjectId(userId) });
  if (!user) {
    throw new UnauthorizedError('Unauthorized');
  }
  return user;
}

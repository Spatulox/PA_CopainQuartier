import dotenv from 'dotenv';
dotenv.config();

const { JWT_SALT, PASSWORD_SALT, MONGO_URL, } = process.env;

if (!JWT_SALT || !PASSWORD_SALT || !MONGO_URL) {
    throw new Error("Missing environment variables: JWT_SALT, PASSWORD_SALT or MONGO_URL");
}

export const config = {
    jwtSalt: JWT_SALT,
    passwordSalt: PASSWORD_SALT,
    mongoUrl: MONGO_URL
};

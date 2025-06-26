import dotenv from 'dotenv';
dotenv.config();

const { JWT_SALT, PASSWORD_SALT, MONGO_URL, MAILER_PASSWORD } = process.env;

if (!JWT_SALT || !PASSWORD_SALT || !MONGO_URL || !MAILER_PASSWORD) {
    throw new Error("Missing environment variables: JWT_SALT, PASSWORD_SALT, MONGO_URL or MAILER_PASSWORD");
}

export const config = {
    jwtSalt: JWT_SALT,
    passwordSalt: PASSWORD_SALT,
    mongoUrl: MONGO_URL,
    mailerParssword : MAILER_PASSWORD
};

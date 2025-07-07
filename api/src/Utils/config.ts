import dotenv from "dotenv";
dotenv.config();

const { JWT_SALT, PASSWORD_SALT, MONGO_URL, MAILER_PASSWORD, LANGAJE_URL } =
  process.env;

for (const [key, value] of Object.entries({
  JWT_SALT,
  PASSWORD_SALT,
  MONGO_URL,
  MAILER_PASSWORD,
  LANGAJE_URL,
})) {
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
}
if (!JWT_SALT || !PASSWORD_SALT || !MONGO_URL || !MAILER_PASSWORD) {
  throw new Error(
    "Missing environment variables: JWT_SALT, PASSWORD_SALT, MONGO_URL or MAILER_PASSWORD"
  );
}

export const config = {
  jwtSalt: JWT_SALT,
  passwordSalt: PASSWORD_SALT,
  mongoUrl: MONGO_URL,
  mailerParssword: MAILER_PASSWORD,
  langajeUrl: LANGAJE_URL,
};

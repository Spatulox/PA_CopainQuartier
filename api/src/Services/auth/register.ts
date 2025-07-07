import { UserRole, UserTable } from "../../DB_Schema/UserSchema";
import type { ConnectionToken, RegisterParams } from "../../Validators/auth";
import { generateToken, JwtType } from "./jwt";
import { hashPassword } from "./password";
import { BadRequestError, InternalServerError } from "routing-controllers";
import { NewsletterSender } from "../../Utils/mailer";

export async function registerUser(params: RegisterParams, file: Express.Multer.File): Promise<ConnectionToken> {
  const user = await saveUser(params, file);

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

async function saveUser(params: RegisterParams, file: Express.Multer.File) {
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
      address: params.address,
      image_link: file ? file.path : null,
    });
    return user;
  } catch (e: any) {
    if (e.code === 11000) {
      throw new BadRequestError("Email already exists");
    }
    throw e;
  }
}

export async function resetPassword(email: string): Promise<void> {

  const user = await UserTable.findOne({ email });
  if (!user) {
    return; // No user found, no need to throw an error to avoid sending it to the client
  }
  const resetNumber = Math.floor(Math.random() * 1000000).toString()
  const resetNumberHashed = await hashPassword(resetNumber);
  const res = await UserTable.updateOne(
    { email },
    { $set: { resetNumber: resetNumberHashed } },
  );
  if (res.modifiedCount === 0) {
    throw new InternalServerError("Plz try again later");
  }

  const newsletterSender = new NewsletterSender();
  newsletterSender.sendNewsletter(
    "[REQUESTED] Réinitialisation d'un mot de passe",
    `Voiçi votre code de réinitialisation : ${resetNumber}`,
    [user.email]
  ).then(console.log);

}

export async function resetPasswordValid(email: string, id: string, newPassword: string): Promise<boolean> {
  const user = await UserTable.findOne({ email });
  if (!user) {
    return false; // No user found, no need to throw an error to avoid sending it to the client
  }

  const hashedPassword = await hashPassword(newPassword);
  const hashedResetNumber = await hashPassword(id);
  const res = await UserTable.updateOne(
    { email, resetNumber: hashedResetNumber},
    { $set: { password: hashedPassword, resetNumber: null } },
  );
  if (res.modifiedCount === 0) {
    throw new BadRequestError("Wrong reset Code");
  }

  const newsletterSender = new NewsletterSender();
  newsletterSender.sendNewsletter(
    "[SUCCESS] Réinitialisation d'un mot de passe",
    `Mot de passe réinitialisé avec succès !!`,
    [user.email]
  ).then(console.log);
  return true
}
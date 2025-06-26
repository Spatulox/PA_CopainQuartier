import {Authorized, BadRequestError, Body, BodyParam, CurrentUser, HttpCode, JsonController, Post, UploadedFile} from "routing-controllers";
import { logout } from "../Services/auth/logout";
import { loginUser, refreshToken } from "../Services/auth/login";
import { registerUser, resetPassword, resetPasswordValid } from "../Services/auth/register";
import { zLoginParams, zRegisterParams, zRefreshToken, zEmail, zResetPassword } from "../Validators/auth";
import { User } from "../Models/UserModel"
import { profileUploadsOptions } from "../Utils/multer";
@JsonController('/auth')
export class AuthController {

	@Post('/login')
	async login(
		@Body() body: unknown
	): Promise<{
		accessToken: string
		refreshToken: string
	}> {
		const loginParams = zLoginParams.parse(body)

		const {refreshToken, accessToken} = await loginUser(loginParams)
		return {accessToken, refreshToken}
	}

	@Post('/reset-password')
	@HttpCode(204)
	async resetPassword(@BodyParam('email') email: string ): Promise<boolean> {
		const validEmail = zEmail.parse(email)
		if (!email) {
			throw new Error("Email is required")
		}
		await resetPassword(validEmail);
		return true
	}

	@Post('/reset-password/valid')
	@HttpCode(204)
	async resetPasswordValid(@Body() body: string ): Promise<boolean> {
		const validBody = zResetPassword.parse(body)
		return await resetPasswordValid(validBody.email, validBody.id.toString(), validBody.password);
	}

	@Post('/register')
	@HttpCode(201)
	async register(@Body() body: unknown, @UploadedFile("image", { options: profileUploadsOptions }) file: Express.Multer.File): Promise<{accessToken: string, refreshToken: string}> {
		const registerParams = zRegisterParams.parse(body)
		const {accessToken, refreshToken} = await registerUser(registerParams, file)

		return {accessToken, refreshToken}
	}
	
	@Post('/refresh')
	async refresh(@Body() token: string): Promise<{ accessToken: string }> {
		const validRefresh = zRefreshToken.parse(token)
		const accessToken = await refreshToken(validRefresh)
		return {accessToken}
	}

	@Post('/logout')
	@HttpCode(204)
	@Authorized()
	async logout(@CurrentUser() user: User): Promise<void> {
		await logout(user)
	}
}
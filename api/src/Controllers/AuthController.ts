import {Authorized, Body, BodyParam, CurrentUser, HttpCode, JsonController, Post} from "routing-controllers";
import { logout } from "../Services/auth/logout";
import { loginUser, refreshToken } from "../Services/auth/login";
import { registerUser } from "../Services/auth/register";
import { zLoginParams, zRegisterParams, zTokens } from "../Validators/auth";
import { User } from "../Models/UserModel"

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

	@Post('/register')
	@HttpCode(201)
	async register(
		@Body() body: unknown
	): Promise<{
		accessToken: string
		refreshToken: string
	}> {
		const registerParams = zRegisterParams.parse(body)
		const {accessToken, refreshToken} = await registerUser(registerParams)

		return {accessToken, refreshToken}
	}

	@Post('/refresh')
	async refresh(
		@BodyParam('refreshToken', {type: String}) token: string
	): Promise<{ accessToken: string }> {
		const accessToken = await refreshToken(token)
		return {accessToken}
	}

	@Post('/logout')
	@HttpCode(204)
	@Authorized()
	async logout(@CurrentUser() user: User): Promise<void> {
		await logout(user)
	}
}
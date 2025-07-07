import {z} from "zod";

export const zLoginParams = z.object({
	email: z.string().email(),
	password: z.string().min(8)
})

export const zEmail = z.string().email()

export type LoginParams = z.infer<typeof zLoginParams>;

export const zRegisterParams = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	phone: z
	  .string()
	  .regex(
		/^\d{10}$/,
		"Numéro de téléphone invalide"
	  ),
	address: z.string().min(5, "Adresse trop courte"),
	lastname: z.string(),
	name: z.string(),
});

export type RegisterParams = z.infer<typeof zRegisterParams>;

export const zResetPassword = z.object({
	email: z.string().email(),
	password: z.string(),
	id: z.coerce.number(),
})

export type ResetParams = z.infer<typeof zResetPassword>

export const zTokens = z.object({
	accessToken: z.string(),
	refreshToken: z.string()
})


export const zRefreshToken = z.object({
  refreshToken: z.string()
})

export type Refreshtoken = z.infer<typeof zRefreshToken>
export type ConnectionToken = z.infer<typeof zTokens>
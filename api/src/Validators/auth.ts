import {z} from "zod";

export const zLoginParams = z.object({
	email: z.string().email(),
	password: z.string().min(8)
})

export type LoginParams = z.infer<typeof zLoginParams>;

export const zRegisterParams = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	phone: z
	  .string()
	  .regex(
		/^\+?[1-9]\d{1,14}$/,
		"Numéro de téléphone invalide (format international attendu)"
	  ),
	address: z.string().min(5, "Adresse trop courte"),
	lastname: z.string(),
	name: z.string(),
});

export type RegisterParams = z.infer<typeof zRegisterParams>;

export const zTokens = z.object({
	accessToken: z.string(),
	refreshToken: z.string()
})


export const zRefreshToken = z.object({
  refreshToken: z.string()
})

export type Refreshtoken = z.infer<typeof zRefreshToken>
export type ConnectionToken = z.infer<typeof zTokens>